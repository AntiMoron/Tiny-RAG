import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Knowledge } from 'tinyrag-types/knowledge';
import { InjectRepository } from '@nestjs/typeorm';
import { KnowledgeEntity } from './knowledge.entity';
import { In, Repository } from 'typeorm';
import { DatasetEntity } from 'src/dataset/dataset.entity';
import * as _ from 'lodash';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { ChunkService } from 'src/chunk/chunk.service';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { Inject, forwardRef } from '@nestjs/common';
import { Dataset } from 'tinyrag-types/dataset';
import { VectorDbService } from 'src/vector-db/vector-db.service';

@Injectable()
export class KnowledgeService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: WinstonLogger,
    @Inject(forwardRef(() => EmbeddingService))
    private readonly embeddingService: EmbeddingService,
    @Inject(forwardRef(() => VectorDbService))
    private readonly vectorDbService: VectorDbService,
    @InjectRepository(DatasetEntity)
    private readonly datasetRepo: Repository<DatasetEntity>,
    @Inject(forwardRef(() => ChunkService))
    private readonly chunkService: ChunkService,
    @InjectRepository(KnowledgeEntity)
    private readonly knowledgeRepo: Repository<KnowledgeEntity>,
  ) {}

  async insertKnowledge(
    knowledge: Omit<Knowledge, 'id' | 'createdAt' | 'updatedAt'>,
  ) {
    const dataset_id = knowledge.dataset_id;
    const datasetEntity = await this.datasetRepo.findOneBy({
      id: dataset_id,
    });
    if (!datasetEntity) {
      throw new HttpException(
        `Dataset ${dataset_id} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    const newKnowledge = this.knowledgeRepo.create(
      _.omitBy(knowledge, ['id']) as Omit<Knowledge, 'id'>,
    );
    return await this.knowledgeRepo.save(newKnowledge);
  }

  async insertOrUpdateExternalKnowledge(
    knowledge: Partial<Omit<Knowledge, 'createdAt' | 'updatedAt'>>,
  ) {
    const oldEntity = knowledge.externalId
      ? await this.knowledgeRepo.findOneBy({
          externalId: knowledge.externalId,
        })
      : null;
    const mergeKnowledge = {
      ...oldEntity,
      ...knowledge,
    };
    const dataset_id = mergeKnowledge.dataset_id;
    const datasetEntity = await this.datasetRepo.findOneBy({
      id: dataset_id,
    });
    if (!datasetEntity) {
      throw new HttpException(
        `Dataset ${dataset_id} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (oldEntity) {
      await this.knowledgeRepo.update({ id: oldEntity.id }, knowledge);
      return mergeKnowledge as KnowledgeEntity;
    } else {
      const newKnowledge = this.knowledgeRepo.create(
        _.omitBy(knowledge, ['id']) as Omit<Knowledge, 'id'>,
      );
      return await this.knowledgeRepo.save(newKnowledge);
    }
  }

  async findByIds(ids: string[]): Promise<Knowledge[]> {
    const client = this.vectorDbService;
    if (!client.ready) {
      throw new Error(`VectorDb client<${client.type}> is not ready yet.`);
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
      id: dataset,
    });
    if (!datasetEntity) {
      throw new HttpException(
        `Dataset ${dataset} not found.`,
        HttpStatus.NOT_FOUND,
      );
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

  async updateKnowledgeStatus(
    id: string,
    indexStatus: 'doing' | 'success' | 'fail',
  ) {
    return await this.knowledgeRepo.update({ id }, { indexStatus });
  }

  async deleteKnowledge(id: string) {
    const knowledge = await this.knowledgeRepo.findOneBy({ id });
    if (!knowledge) {
      throw new HttpException(
        `Knowledge ${id} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    const datasetId = knowledge.dataset_id;
    const dataset = await this.datasetRepo.findOneBy({ id: datasetId });
    if (!dataset) {
      throw new HttpException(
        `Dataset ${datasetId} not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.deleteRelatedChunks(dataset as Dataset, id);
    return await this.knowledgeRepo.delete({ id });
  }

  private async deleteRelatedChunks(dataset: Dataset, knowledgeId: string) {
    const chunks = await this.chunkService.getChunksByKnowledgeId(knowledgeId);
    await this.chunkService.deleteChunks(chunks.map((a) => a.id));
    await this.vectorDbService.deleteEntities({
      dataset,
      knowledgeId: knowledgeId,
    });
  }
}
