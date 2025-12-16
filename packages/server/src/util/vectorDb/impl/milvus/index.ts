import { ChunkIndex } from 'tinyrag-types/chunk';
import { Dataset } from 'tinyrag-types/dataset';
import VectorDBBase, { VectorDBType } from '../../interface';
import {
  CreateIndexParam,
  MilvusClient,
  RowData,
} from '@zilliz/milvus2-sdk-node';
import getEnvConfigValue from 'src/util/getEnvConfigValue';
import getMilvusCollectionSchema from './schema';
import { WinstonLogger } from 'nest-winston';

export default class MilvusVectorDB implements VectorDBBase {
  private _ready = false;
  private milvusClient: MilvusClient;
  static type = VectorDBType.MILVUS;

  async deleteEntities(
    logger: WinstonLogger,
    filter: {
      dataset: Dataset;
      knowledgeId?: string;
      chunkIds?: string[];
    },
  ): Promise<void> {
    const { knowledgeId, chunkIds, dataset } = filter;

    if (!filter?.dataset) {
      throw new Error('删除实体失败：dataset 参数不能为空');
    }

    if (!filter.knowledgeId && !filter.chunkIds) {
      throw new Error(
        '删除实体失败：必须提供 knowledgeId 或 chunkIds 作为删除条件',
      );
    }

    let expr = '';

    try {
      const collectionName = this.getCollectionNameForEmbeddingAIProvider(
        dataset.embededByProviderId,
      );

      if (knowledgeId && chunkIds) {
        // 同时提供 knowledgeId 和 chunkIds：删除指定知识下的指定分片
        const chunkIdsStr = chunkIds.map((id) => `'${id}'`).join(',');
        expr = `knowledge_id == '${knowledgeId}' && chunk_id in [${chunkIdsStr}]`;
      } else if (knowledgeId) {
        // 仅提供 knowledgeId：删除该知识下的所有实体
        expr = `knowledge_id == '${knowledgeId}'`;
      } else if (chunkIds) {
        // 仅提供 chunkIds：删除指定分片的实体
        const chunkIdsStr = chunkIds.map((id) => `'${id}'`).join(',');
        expr = `chunk_id in [${chunkIdsStr}]`;
      }
      const deleteResult = await this.milvusClient.deleteEntities({
        collection_name: collectionName,
        expr,
        // 可选：添加超时配置（根据实际需求调整）
        timeout: 30000,
      });
      logger.debug?.(
        `删除 Milvus 实体成功，集合：${collectionName}，影响行数：${deleteResult?.delete_cnt || 0}`,
      );
    } catch (error) {
      throw new Error(`删除实体失败：${(error as Error).message}`);
    }
  }

  async init() {
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
      this._ready = true;
      console.log('Node client is initialized.');
    };
    await initImpl();
  }

  async destroy(): Promise<void> {
    this._ready = false;
    await this.milvusClient.closeConnection();
  }

  getCollectionNameForEmbeddingAIProvider(aiProviderId: string): string {
    const COLLECTION_NAME = getEnvConfigValue('MILVUS_CHUNK_COLLECTION_NAME');
    return `${COLLECTION_NAME}_${aiProviderId.replace(/-/g, '_')}`;
  }

  async checkAndCreateCollectionForEmbeddingAIProvider(
    aiProviderId: string,
    embeddingDim: number,
  ) {
    const COLLECTION_NAME =
      this.getCollectionNameForEmbeddingAIProvider(aiProviderId);
    const { value: hasCreated } = await this.milvusClient.hasCollection({
      collection_name: COLLECTION_NAME,
    });
    const collectionSchema = getMilvusCollectionSchema(embeddingDim);
    if (!hasCreated) {
      // load collection
      await this.milvusClient
        .createCollection({
          collection_name: COLLECTION_NAME,
          fields: collectionSchema,
          index_params: collectionSchema
            .filter((a) => a.isIndex)
            .map((field) => {
              return {
                field_name: field.name,
                index_name: `${field.name}_index`,
                index_type: 'AUTOINDEX',
                metric_type: 'COSINE',
              } as CreateIndexParam;
            }) as any,
        })
        .then((create) => {
          console.log('Create collection is finished.', create);
        });

      await this.milvusClient.loadCollectionSync({
        collection_name: COLLECTION_NAME,
      });
    }
  }

  get ready(): boolean {
    return this._ready;
  }

  async search(
    logger: WinstonLogger,
    params: {
      data: number[];
      dataset: Dataset;
      limit: number;
    },
  ): Promise<(ChunkIndex & { score: number })[]> {
    if (!this.ready) {
      throw new Error('Not ready yet.');
    }
    const count = params.limit;
    const datasetId = params.dataset.id;
    const targetVector = params.data;
    const embededByProviderId = params.dataset.embededByProviderId;
    const collectionName =
      this.getCollectionNameForEmbeddingAIProvider(embededByProviderId);
    await this.checkAndCreateCollectionForEmbeddingAIProvider(
      embededByProviderId,
      targetVector.length,
    );
    const retriveResult = await this.milvusClient.search({
      collection_name: collectionName,
      // Milvus expects an array of vectors (batch), so wrap targetVector
      data: targetVector,
      // do not restrict partition here unless you are sure data was inserted into it
      // partition_names: [datasetId],
      filter: `dataset_id == '${datasetId}'`,
      anns_field: 'vector',
      metric_type: 'COSINE',
      // topk / limit: ensure we request the right number of neighbors
      limit: count,
      // use ANN search params (nprobe) as JSON string per SDK expectations
      search_params: {
        topk: count,
        params: JSON.stringify({ nprobe: 64 }),
      },
    });

    // debug: log raw milvus response when nothing matched
    if (
      !retriveResult ||
      !retriveResult.results ||
      retriveResult.results.length === 0
    ) {
      console.log('Milvus search raw response:', JSON.stringify(retriveResult));
    }

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

  async insert(
    logger: WinstonLogger,
    params: {
      dataset: Dataset;
      embeddingDim: number;
      fieldsData: ChunkIndex[];
    },
  ): Promise<void> {
    const { fieldsData, dataset } = params;
    const collectionName = this.getCollectionNameForEmbeddingAIProvider(
      params.dataset.embededByProviderId,
    );
    await this.checkAndCreateCollectionForEmbeddingAIProvider(
      dataset.embededByProviderId,
      params.embeddingDim,
    );
    const insertRes = await this.milvusClient.insert({
      collection_name: collectionName,
      fields_data: fieldsData as unknown as RowData[],
    });
    console.log('Milvus insert result:', insertRes);

    // ensure data is flushed so it becomes searchable immediately
    try {
      await this.milvusClient.flush({ collection_names: [collectionName] });
    } catch (err) {
      // some SDK versions provide flushSync; if flush fails just log it
      console.warn(
        'Milvus flush failed (continuing):',
        (err as Error)?.message || err,
      );
    }
  }
}
