import { ChunkIndex, ChunkRetrieveResult } from 'tinyrag-types/chunk';
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
  abstract search(params: {
    data: number[]; // target vector
    dataset: Dataset;
    limit: number; // max result.
  }): Promise<(ChunkIndex & { score: number })[]>;

  abstract insert(params: {
    dataset: Dataset;
    embeddingDim: number;
    fieldsData: ChunkIndex[];
  }): Promise<void>;

  abstract deleteEntities(
    filter:
      | {
          dataset: Dataset;
          knowledgeId: string;
        }
      | {
          dataset: Dataset;
          chunkId: string;
        },
  ): Promise<void>;
}
