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

  async getChunkById(id: string): Promise<ChunkEntity | null> {
    return await this.chunkRepo.findOneBy({ id });
  }

  async updateChunkStatus(id: string, status: 'doing' | 'success' | 'fail') {
    return await this.chunkRepo.update({ id }, { indexStatus: status });
  }

  async insertChunk(chunk: Omit<ChunkEntity, 'id' | 'createdAt'>) {
    const newChunk = this.chunkRepo.create(chunk);
    return this.chunkRepo.save(newChunk);
  }

  async getChunkStatusByKnowledgeId(knowledgeId: string) {
    return this.chunkRepo.find({
      where: { knowledge_id: knowledgeId },
      select: ['id', 'indexStatus'],
    });
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

  async deleteChunks(ids: string[]) {
    return await this.chunkRepo.delete({ id: In(ids) });
  }
}
