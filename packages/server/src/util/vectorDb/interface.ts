import { WinstonLogger } from 'nest-winston';
import { ChunkIndex } from 'tinyrag-types/chunk';
import { Dataset } from 'tinyrag-types/dataset';

export enum VectorDBType {
  MILVUS = 'milvus',
}

export default abstract class VectorDBInterface {
  /**
   * @enum
   */
  static type: VectorDBType;

  abstract init(): Promise<void>;

  abstract destroy(): Promise<void>;

  /**
   * If client is ready to use
   */
  abstract get ready(): boolean;

  /**
   * Search data in dataset.
   * @param params
   */
  abstract search(
    logger: WinstonLogger,
    params: {
      data: number[]; // target vector
      dataset: Dataset;
      limit: number; // max result.
    },
  ): Promise<(ChunkIndex & { score: number })[]>;

  abstract insert(
    logger: WinstonLogger,
    params: {
      dataset: Dataset;
      embeddingDim: number;
      fieldsData: ChunkIndex[];
    },
  ): Promise<void>;

  abstract deleteEntities(
    logger: WinstonLogger,
    filter: {
      dataset: Dataset;
      knowledgeId?: string;
      chunkIds?: string[];
    },
  ): Promise<void>;
}
