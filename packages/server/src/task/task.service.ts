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
import getEnvConfigValue from 'src/util/getEnvConfigValue';
import { VectorDbService } from 'src/vector-db/vector-db.service';
import * as fs from 'fs-extra';
import { join, relative } from 'path';

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
    private readonly vectorDbService: VectorDbService,
  ) {}

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
        const client = this.vectorDbService;

        if (!client.ready) {
          throw new Error(`Vector DB client<${client.type}> is not ready yet.`);
        }
        await client.insert(dataset, vector.length, [
          {
            chunk_id: chunkId,
            knowledge_id: knowledge_id,
            dataset_id: dataset_id,
            vector,
          },
        ]);
        await this.chunkService.updateChunkStatus(chunkId, 'success');
      } catch (err) {
        this.logger.error(err);
        await this.chunkService.updateChunkStatus(chunkId, 'fail');
      }
      if (taskType === 'chunk_last_index') {
        // final check
        const { knowledge_id, to_delete_chunk_ids: deleteChunkIds } =
          data as ChunkLastIndexTaskBodyData;
        const knowledge = (
          await this.knowledgeService.findByIds([knowledge_id])
        )?.[0];
        const datasetId = knowledge?.dataset_id;
        if (!knowledge || !datasetId) {
          throw new Error('Knowledge not found: ' + knowledge_id);
        }

        const dataset = await this.datasetService.getDatasetById(datasetId);
        if (!dataset) {
          throw new Error('Dataset not found: ' + datasetId);
        }
        const allChunks =
          await this.chunkService.getChunkStatusByKnowledgeId(knowledge_id);
        const isOldMap: Record<string, boolean> = Array.isArray(deleteChunkIds)
          ? deleteChunkIds.reduce(
              (acc, curr) => {
                acc[curr] = true;
                return acc;
              },
              {} as Record<string, boolean>,
            )
          : {};
        const anyFail = allChunks
          .filter((a) => {
            return !isOldMap[a.id];
          })
          .some((c) => c.indexStatus === 'fail');
        if (anyFail) {
          await this.knowledgeService.updateKnowledgeIndexStatus(
            knowledge_id,
            'fail',
          );
        } else {
          if (deleteChunkIds && deleteChunkIds.length > 0) {
            try {
              await this.chunkService.deleteChunks(deleteChunkIds);
              await this.vectorDbService.deleteEntities({
                dataset,
                chunkIds: deleteChunkIds,
              });
            } catch (err) {
              this.logger.error('Failed to delete old chunks:', err);
            }
          }
          await this.knowledgeService.updateKnowledgeIndexStatus(
            knowledge_id,
            'success',
          );
        }
      }
    } else if (taskType === 'sync_doc') {
      const {
        type,
        appId,
        appSecret,
        docUrl,
        docToken,
        datasetId,
        knowledge_id: knowledgeId,
      } = data as SyncDocTaskBodyData;
      if (knowledgeId) {
        await this.knowledgeService.updateKnowledgeIndexStatus(
          knowledgeId,
          'doing',
        );
      }
      const dataset = await this.datasetService.getDatasetById(datasetId);
      if (!dataset) {
        throw new Error('Dataset not found: ' + datasetId);
      }
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
        handleImage: async (fileDir: string) => {
          // default we'll use nestjs public host
          const publicHost = getEnvConfigValue('PUBLIC_HOST');
          const baseDir = join(__dirname, '..', '..');
          const relativePath = relative(baseDir, fileDir);
          const targetDir = join(baseDir, './public/', relativePath);
          await fs.move(fileDir, targetDir, {
            overwrite: true, // 目标文件已存在时覆盖（可选，默认 false）
            errorOnExist: false, // 配合 overwrite: true 使用，避免报错
          });
          const fileUrl = `${publicHost}/public/${relativePath}`;
          return fileUrl;
        },
      });

      const embededByProviderId = dataset.embededByProviderId;
      const knowledgeEntity =
        await this.knowledgeService.insertOrUpdateExternalKnowledge({
          id: data.knowledge_id,
          content,
          dataset_id: datasetId,
          externalId: docToken || '',
        });
      const originalChunks = await this.chunkService.getChunksByKnowledgeId(
        knowledgeEntity.id,
      );
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
            // since we need to upgrade that, we need to clean up old knowledge first.
            to_delete_chunk_ids: originalChunks?.map((a) => a.id) || [],
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
