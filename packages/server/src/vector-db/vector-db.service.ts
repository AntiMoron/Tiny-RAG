import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import getEnvConfigValue from 'src/util/getEnvConfigValue';
import createVectorDbClient from 'src/util/vectorDb';
import VectorDBInterface from 'src/util/vectorDb/interface';
import { ChunkIndex } from 'tinyrag-types/chunk';
import { Dataset } from 'tinyrag-types/dataset';

@Injectable()
export class VectorDbService {
  type = '';
  private client: VectorDBInterface;

  constructor() {
    const vectorDbType = getEnvConfigValue('VECTOR_DB_TYPE');
    this.type = vectorDbType;
    this.client = createVectorDbClient(vectorDbType)!;
  }

  async onModuleInit() {
    await this.client.init();
  }

  async onModuleDestroy() {
    await this.client.destroy();
  }

  get ready(): boolean {
    return this.client.ready;
  }

  async insert(
    dataset: Dataset,
    embeddingDim: number,
    fieldsData: ChunkIndex[],
  ) {
    await this.client.insert({ dataset, embeddingDim, fieldsData });
  }

  async search(params: {
    data: number[]; // target vector
    dataset: Dataset;
    limit: number; // max result.
  }) {
    return await this.client.search(params);
  }

  async deleteEntities(params: { dataset: Dataset; knowledgeId: string }) {
    await this.client.deleteEntities(params);
  }
}
