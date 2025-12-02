import { Injectable } from '@nestjs/common';
import { Knowledge, KnowledgeIndex } from 'src/types/knowledge';
import { InjectRepository } from '@nestjs/typeorm';
import { KnowledgeEntity } from './knowledge.entity';
import { In, Repository } from 'typeorm';
import { DatasetEntity } from 'src/dataset/dataset.entity';
import { MilvusService } from 'src/milvus/milvus.service';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';
import { WinstonLogger } from 'nest-winston';
import { ChunksplitService } from 'src/chunksplit/chunksplit.service';
import { ChunkService } from 'src/chunk/chunk.service';
import { EmbeddingService } from 'src/embedding/embedding.service';

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly logger: WinstonLogger,
    private readonly configService: ConfigService,
    private readonly embeddingService: EmbeddingService,
    private readonly chunkService: ChunkService,
    private readonly chunkSplitService: ChunksplitService,
    private readonly milvusService: MilvusService,
    @InjectRepository(DatasetEntity)
    private readonly datasetRepo: Repository<DatasetEntity>,

    @InjectRepository(KnowledgeEntity)
    private readonly knowledgeRepo: Repository<KnowledgeEntity>,
  ) {}

  private get collectionName(): string {
    return this.configService.get<string>('COLLECTION_NAME') || '';
  }

  async findSimilarKnowledge(
    datasetId: string,
    vector: number[],
  ): Promise<KnowledgeIndex[]> {
    const client = this.milvusService.client;
    if (!client) {
      throw new Error('Milvus client is not ready yet.');
    }
    // Perform a vector search on the collection
    const res = await client.search({
      // required
      collection_name: this.collectionName, // required, the collection name
      data: vector, // required, vector used to compare other vectors in milvus
      // optionals
      filter: `dataset_id = ${datasetId}`, // optional, filter expression
      params: { nprobe: 64 }, // optional, specify the search parameters
      limit: 10, // optional, specify the number of nearest neighbors to return
    });
    return res.results as unknown as KnowledgeIndex[];
  }

  async insertKnowledge(knowledge: Knowledge) {
    const dataset_id = knowledge.dataset_id;
    const datasetEntity = await this.datasetRepo.findOneBy({
      name: dataset_id,
    });
    if (!datasetEntity) {
      throw new Error(`Dataset ${dataset_id} not found.`);
    }
    const newKnowledge = this.knowledgeRepo.create(
      _.omitBy(knowledge, ['id']) as KnowledgeEntity,
    );
    const { content } = knowledge;
    const chunks = await this.chunkSplitService.splitChunks(content);
    let sucCnt = 0;
    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];
      try {
        const embedResponse = await this.embeddingService.embedById(
          knowledge.embededByProviderId,
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
              knowledge_id: knowledge.id,
              vector,
            },
          ],
        });
        await this.chunkService.insertChunk({
          dataset_id: datasetEntity.id,
          knowledge_id: newKnowledge.id,
          embededByProviderId: knowledge.embededByProviderId,
          content: chunkContent,
          indexStatus: 'success',
        });
        sucCnt += 1;
      } catch {
        this.logger.error('Failed to insert chunk:', chunkContent);
        await this.chunkService.insertChunk({
          dataset_id: datasetEntity.id,
          knowledge_id: newKnowledge.id,
          embededByProviderId: knowledge.embededByProviderId,
          content: chunkContent,
          indexStatus: 'failure',
        });
      }
    }
    const result = await this.knowledgeRepo.save(newKnowledge);
    try {
      if (sucCnt === chunks.length) {
        await this.knowledgeRepo.update(result.id, { indexStatus: 'success' });
      } else {
        await this.knowledgeRepo.update(result.id, { indexStatus: 'failed' });
      }
    } catch (err) {
      this.logger.error(err);
      await this.knowledgeRepo.update(result.id, { indexStatus: 'failed' });
    }
  }

  async findByIds(ids: string[]): Promise<Knowledge[]> {
    const client = this.milvusService.client;
    if (!client) {
      throw new Error('Milvus client is not ready yet.');
    }
    const results = await this.knowledgeRepo.findBy({
      id: In(ids),
    });
    return results.map((item) => {
      return {
        ...item,
      };
    });
  }

  async listKnowledge(dataset: string): Promise<Knowledge[]> {
    const datasetEntity = await this.datasetRepo.findOneBy({
      name: dataset,
    });
    if (!datasetEntity) {
      throw new Error(`Dataset ${dataset} not found.`);
    }
    const knowledgeEntities = await this.knowledgeRepo.findBy({
      dataset_id: datasetEntity.id,
    });
    return knowledgeEntities.map((item) => {
      return {
        ...item,
      };
    });
  }

  async getKnowledgeCount(datasetId: string) {
    return await this.knowledgeRepo.countBy({ dataset_id: datasetId });
  }
}
