import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import doc2Markdown from 'feishu2markdown';
import { KnowledgeService } from 'src/knowledge/knowledge.service';
import {
  ChunkIndexTaskBodyData,
  ChunkLastIndexTaskBodyData,
  SyncDocTaskBodyData,
  TaskBody,
} from 'tinyrag-types/task';
import { QueueService } from './queue.service';
import { ChunksplitService } from 'src/chunksplit/chunksplit.service';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { ChunkService } from 'src/chunk/chunk.service';
import { DatasetService } from 'src/dataset/dataset.service';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { MilvusService } from 'src/milvus/milvus.service';
import getEnvConfigValue from 'src/util/getEnvConfigValue';

@Injectable()
export class TaskService implements OnModuleInit {
  constructor(
    private readonly knowledgeService: KnowledgeService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: WinstonLogger,
    private readonly embeddingService: EmbeddingService,
    private readonly datasetService: DatasetService,
    private readonly chunkService: ChunkService,
    private readonly chunksplitService: ChunksplitService,
    private readonly queueService: QueueService,
    private readonly milvusService: MilvusService,
  ) {}

  private get collectionName(): string {
    return getEnvConfigValue('MILVUS_CHUNK_COLLECTION_NAME');
  }

  async onModuleInit() {
    // Register the processor so workers will execute tasks.
    await this.queueService.registerProcessor(this.handleTask.bind(this));
  }

  async getTaskStatus() {
    return await this.queueService.getTaskStatus();
  }

  async getTaskStatusById(id: string) {
    return await this.queueService.getTaskStatusById(id);
  }

  // Public API used by controllers or other services to enqueue work
  async addTask(taskBody: TaskBody) {
    return await this.queueService.addTask(taskBody);
  }

  /**
   * Actual task processor executed by worker(s). This function may create
   * additional tasks by calling `createTask`.
   */
  async handleTask(taskBody: TaskBody) {
    const { type: taskType, data } = taskBody;
    if (taskType === 'chunk_index' || taskType === 'chunk_last_index') {
      const { chunkId } = data as ChunkIndexTaskBodyData;
      try {
        const chunkEntity = await this.chunkService.getChunkById(chunkId);
        if (!chunkEntity) {
          throw new Error('Chunk not found.');
        }
        const { knowledge_id, dataset_id } = chunkEntity;
        const dataset = await this.datasetService.getDatasetById(dataset_id);
        if (!dataset) {
          throw new Error('Dataset not found: ' + dataset_id);
        }
        const chunkContent = chunkEntity.content;
        const embedResponse = await this.embeddingService.embedById(
          chunkEntity.embededByProviderId,
          chunkContent,
        );
        const vector = embedResponse?.data.result;
        if (!vector || vector.length === 0) {
          this.logger.error('Failed to get embedding for chunk:', chunkContent);
          throw new Error('Empty embedding result');
        }
        const client = this.milvusService.client;

        if (!client) {
          throw new Error('Milvus client is not ready yet.');
        }
        await client.insert({
          collection_name: this.collectionName,
          fields_data: [
            {
              chunk_id: chunkId,
              knowledge_id: knowledge_id,
              dataset_id: dataset_id,
              vector,
            },
          ],
        });
        await this.chunkService.updateChunkStatus(chunkId, 'success');
      } catch (err) {
        this.logger.error(err);
        await this.chunkService.updateChunkStatus(chunkId, 'fail');
      }
      if (taskType === 'chunk_last_index') {
        // final check
        const { knowledge_id } = data as ChunkLastIndexTaskBodyData;
        const allChunks =
          await this.chunkService.getChunkStatusByKnowledgeId(knowledge_id);
        const anyFail = allChunks.some((c) => c.indexStatus === 'fail');
        if (anyFail) {
          await this.knowledgeService.updateKnowledgeStatus(
            knowledge_id,
            'fail',
          );
        } else {
          await this.knowledgeService.updateKnowledgeStatus(
            knowledge_id,
            'success',
          );
        }
      }
    } else if (taskType === 'sync_doc') {
      const { type, appId, appSecret, docUrl, docToken, datasetId } =
        data as SyncDocTaskBodyData;
      // 1. fetch content
      // 2. create a knowledge as a document.
      // 3. chunk it
      // Convert doc -> markdown
      let content = '';
      await doc2Markdown({
        type: type as 'feishu',
        appId,
        appSecret,
        docUrl,
        docToken: docToken as string,
        onDocFinish: (docId, markdown: string, metadata: any) => {
          content = markdown;
        },
        handleImage: (fileDir: string) => {
          return fileDir;
        },
      });

      const dataset = await this.datasetService.getDatasetById(datasetId);
      if (!dataset) {
        throw new Error('Dataset not found: ' + datasetId);
      }
      const embededByProviderId = dataset.embededByProviderId;
      const knowledgeEntity = await this.knowledgeService.insertKnowledge({
        content,
        dataset_id: datasetId,
      });

      const chunks = await this.chunksplitService.splitChunks(content);
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const newChunkEntity = await this.chunkService.insertChunk({
          content: chunk,
          dataset_id: datasetId,
          knowledge_id: knowledgeEntity.id,
          embededByProviderId,
          indexStatus: 'doing',
        });
        const chunkIndexTask: ChunkIndexTaskBodyData = {
          type: 'chunk_index',
          chunkId: newChunkEntity.id,
        };
        if (i === chunks.length - 1) {
          const chunkLastIndexBodyData: ChunkLastIndexTaskBodyData = {
            knowledge_id: knowledgeEntity.id,
            ...chunkIndexTask,
          };
          // if it's last, notify the knowledge to check if all chunks are done
          await this.addTask({
            type: 'chunk_last_index',
            data: chunkLastIndexBodyData,
          });
        } else {
          await this.addTask({
            type: 'chunk_index',
            data: chunkIndexTask,
          });
        }
      }
    }
  }
}
