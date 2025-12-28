import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ChunkEntity } from 'src/chunk/chunk.entity';
import { ChunkService } from 'src/chunk/chunk.service';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { VectorDbService } from 'src/vector-db/vector-db.service';
import { ChunkIndex, ChunkRetrieveResult } from 'tinyrag-types/chunk';
import { Dataset } from 'tinyrag-types/dataset';
import * as _ from 'lodash';

@Injectable()
export class RetrieveService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly vectorDbService: VectorDbService,
    private readonly chunkService: ChunkService,
  ) {}

  async retieveEmbeddingData(
    dataset: Dataset,
    question: string,
    count: number,
    pReason?: 'test',
  ): Promise<ChunkRetrieveResult[]> {
    const { embededByProviderId } = dataset;
    const questionEmbedding = await this.embeddingService.embedById(
      embededByProviderId,
      question,
      pReason,
    );
    const targetVector = questionEmbedding?.data?.result;
    if (!targetVector) {
      throw new HttpException(
        'Failed to get embedding vector',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const retriveResult = await this.vectorDbService.search({
      data: targetVector,
      dataset,
      limit: count,
    });

    const results = retriveResult?.map((item) => {
      return {
        dataset_id: item.dataset_id,
        knowledge_id: item.knowledge_id,
        chunk_id: item.chunk_id,
        vector: item.vector,
        score: item.score,
      } as ChunkIndex & { score: number };
    });
    const chunkIds = results?.map((item) => item.chunk_id) || [];
    const chunkData = await this.chunkService.getChunksByIds(chunkIds);
    const chunkDataMap = chunkData.reduce(
      (pre, cur) => {
        if (!cur) {
          return pre;
        }
        pre[cur.id] = cur;
        return pre;
      },
      {} as Record<string, ChunkEntity>,
    );
    const withContent = results
      ?.map((item) => {
        const { chunk_id: chunkId } = item;
        const originChunk = chunkDataMap[chunkId];
        if (_.isNil(originChunk)) {
          return item as unknown as ChunkRetrieveResult;
        }
        return {
          ...item,
          ...originChunk,
        };
      })
      .filter((item) => !_.isEmpty(item?.content));

    return withContent;
  }
}
