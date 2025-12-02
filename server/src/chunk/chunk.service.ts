import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChunkEntity } from './chunk.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class ChunkService {
  constructor(
    @InjectRepository(ChunkEntity)
    private readonly chunkRepo: Repository<ChunkEntity>,
  ) {}

  async insertChunk(chunk: Partial<ChunkEntity>) {
    const newChunk = this.chunkRepo.create(chunk);
    return this.chunkRepo.save(newChunk);
  }

  async getChunksByKnowledgeId(knowledgeId: string) {
    return this.chunkRepo.find({
      where: { knowledge_id: knowledgeId },
    });
  }

  async getChunksByIds(ids: string[]): Promise<ChunkEntity[]> {
    return this.chunkRepo.find({
      where: {
        id: In(ids),
      },
    });
  }
}
