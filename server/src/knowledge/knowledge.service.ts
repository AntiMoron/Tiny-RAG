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

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly logger: WinstonLogger,
    private readonly configService: ConfigService,
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
    const result = await this.knowledgeRepo.save(newKnowledge);
    try {
      const client = this.milvusService.client;
      if (!client) {
        throw new Error('Milvus client is not ready yet.');
      }
      const { embedding } = knowledge;
      if (!embedding) {
        throw new Error('Embedding data is required to insert knowledge.');
      }
      await client.insert({
        collection_name: this.collectionName,
        fields_data: [
          {
            knowledge_id: knowledge.id,
            vector: embedding?.result,
          },
        ],
      });
      await this.knowledgeRepo.update(result.id, { indexStatus: 'success' });
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
