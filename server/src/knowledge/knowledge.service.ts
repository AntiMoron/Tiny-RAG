import { Injectable } from '@nestjs/common';
import { MilvusClient, InsertReq, DataType } from '@zilliz/milvus2-sdk-node';
import { EmbeddingService } from '../embedding/embedding.service';
import milvusSchema from './milvusSchema';
import { Knowledge, KnowledgeIndex } from 'src/types/knowledge';
import { InjectRepository } from '@nestjs/typeorm';
import { KnowledgeEntity } from './knowledge.entity';
import * as _ from 'lodash';
import { In, Repository } from 'typeorm';
import { DatasetEntity } from 'src/dataset/dataset.entity';

const COLLECTION_NAME = 'knowledges';
const COLLECTION_ADDR = process.env.MILVUS_ADDR || 'localhost:19530';
const COLLECTION_USER_NAME =
  process.env.MILVUS_COLLECTION_USER_NAME || 'username';
const COLLECTION_PASSWORD =
  process.env.MILVUS_COLLECTION_PASSWORD || 'Aa12345!!';

@Injectable()
export class KnowledgeService {
  private ready = false;
  private milvusClient: MilvusClient;

  constructor(
    @InjectRepository(DatasetEntity)
    private readonly datasetRepo: Repository<DatasetEntity>,

    @InjectRepository(KnowledgeEntity)
    private readonly knowledgeRepo: Repository<KnowledgeEntity>,
  ) {
    // build client
    this.milvusClient = new MilvusClient({
      address: COLLECTION_ADDR,
      username: COLLECTION_USER_NAME,
      password: COLLECTION_PASSWORD,
    });
    this.milvusClient.connectPromise.then(async () => {
      const { value: hasCreated } = await this.milvusClient.hasCollection({
        collection_name: COLLECTION_NAME,
      });
      if (!hasCreated) {
        // load collection
        await this.milvusClient
          .createCollection({
            collection_name: COLLECTION_NAME,
            fields: milvusSchema,
          })
          .then((create) => {
            console.log('Create collection is finished.', create);
          });
        await this.milvusClient.loadCollectionSync({
          collection_name: COLLECTION_NAME,
        });
      }
      this.ready = true;
      console.log('Node client is initialized.');
    });
  }

  async findSimilarKnowledge(
    datasetId: string,
    vector: number[],
  ): Promise<KnowledgeIndex[]> {
    if (!this.ready) {
      throw new Error('Milvus client is not ready yet.');
    }
    // Perform a vector search on the collection
    const res = await this.milvusClient.search({
      // required
      collection_name: COLLECTION_NAME, // required, the collection name
      data: vector, // required, vector used to compare other vectors in milvus
      // optionals
      filter: `dataset_id = ${datasetId}`, // optional, filter expression
      params: { nprobe: 64 }, // optional, specify the search parameters
      limit: 10, // optional, specify the number of nearest neighbors to return
    });
    return res.results as unknown as KnowledgeIndex[];
  }

  async insertKnowledge(knowledge: Knowledge) {
    if (!this.ready) {
      throw new Error('Milvus client is not ready yet.');
    }
    const { embedding } = knowledge;
    if (!embedding) {
      throw new Error('Embedding data is required to insert knowledge.');
    }
    await this.milvusClient.insert({
      collection_name: COLLECTION_NAME,
      fields_data: [
        {
          knowledge_id: knowledge.id,
          vector: embedding?.result,
        },
      ],
    });
  }

  async findByIds(ids: string[]): Promise<Knowledge[]> {
    if (!this.ready) {
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
}
