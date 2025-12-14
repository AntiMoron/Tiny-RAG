import { ChunkRetrieveResult, ChunkIndex } from 'tinyrag-types/chunk';
import { Dataset } from 'tinyrag-types/dataset';
import VectorDBBase, { VectorDBType } from '../../interface';
import { MilvusClient, RowData } from '@zilliz/milvus2-sdk-node';
import getEnvConfigValue from 'src/util/getEnvConfigValue';
import collectionSchema from './schema';
import * as _ from 'lodash';

export default class MilvusVectorDB implements VectorDBBase {
  async deleteEntities(filter: { knowledgeId: string }): Promise<void> {
    const { knowledgeId } = filter;
    if (knowledgeId) {
      await this.milvusClient.deleteEntities({
        collection_name: this.collectionName,
        expr: `knowledge_id = ${knowledgeId}`,
      });
    }
  }
  private _ready = false;
  private milvusClient: MilvusClient;
  static type = VectorDBType.MILVUS;

  private get collectionName(): string {
    return getEnvConfigValue('MILVUS_CHUNK_COLLECTION_NAME');
  }
  async init() {
    const COLLECTION_NAME = getEnvConfigValue('MILVUS_CHUNK_COLLECTION_NAME');
    const COLLECTION_ADDR = getEnvConfigValue('MILVUS_ADDR');
    const COLLECTION_USER_NAME = getEnvConfigValue(
      'MILVUS_COLLECTION_USER_NAME',
    );
    const COLLECTION_PASSWORD = getEnvConfigValue('MILVUS_COLLECTION_PASSWORD');

    // build client
    this.milvusClient = new MilvusClient({
      address: COLLECTION_ADDR,
      username: COLLECTION_USER_NAME,
      password: COLLECTION_PASSWORD,
    });

    const initImpl = async () => {
      await this.milvusClient.connectPromise;
      await this.milvusClient.dropCollection({
        collection_name: COLLECTION_NAME,
      });
      const { value: hasCreated } = await this.milvusClient.hasCollection({
        collection_name: COLLECTION_NAME,
      });

      if (!hasCreated) {
        // load collection
        await this.milvusClient
          .createCollection({
            collection_name: COLLECTION_NAME,
            fields: collectionSchema,
          })
          .then((create) => {
            console.log('Create collection is finished.', create);
          });

        await Promise.allSettled(
          collectionSchema
            .filter((a) => a.isIndex)
            .map(async (field) => {
              await this.milvusClient.createIndex({
                collection_name: COLLECTION_NAME,
                field_name: field.name,
                index_name: `${field.name}_index`,
                index_type: 'IVF_FLAT',
                params: { nlist: 128 },
              });
            }),
        );

        await this.milvusClient.loadCollectionSync({
          collection_name: COLLECTION_NAME,
        });
      }
      this._ready = true;
      console.log('Node client is initialized.');
    };
    await initImpl();
  }

  async destroy(): Promise<void> {
    this._ready = false;
    await this.milvusClient.closeConnection();
  }

  get ready(): boolean {
    return this._ready;
  }

  async search(params: {
    data: number[];
    dataset: Dataset;
    limit: number;
  }): Promise<(ChunkIndex & { score: number })[]> {
    if (!this.ready) {
      throw new Error('Not ready yet.');
    }
    const count = params.limit;
    const datasetId = params.dataset.id;
    const targetVector = params.data;
    const retriveResult = await this.milvusClient.search({
      collection_name: this.collectionName,
      data: [targetVector],
      filter: `dataset_id = '${datasetId}'`,
      params: { nprobe: 64 },
      limit: count,
      anns_field: 'vector',
    });

    const results = retriveResult?.results?.map((item) => {
      return {
        dataset_id: item.dataset_id,
        knowledge_id: item.knowledge_id,
        chunk_id: item.chunk_id,
        vector: item.vector,
        score: item.score,
      } as ChunkIndex & { score: number };
    });

    return results || [];
  }

  async insert(params: { fieldsData: ChunkIndex[] }): Promise<void> {
    const { fieldsData } = params;
    await this.milvusClient.insert({
      collection_name: this.collectionName,
      fields_data: fieldsData as unknown as RowData[],
    });
  }
}
