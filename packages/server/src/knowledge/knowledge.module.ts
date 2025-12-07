import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { KnowledgeEntity } from './knowledge.entity';
import { DatasetEntity } from 'src/dataset/dataset.entity';
import { MilvusModule } from 'src/milvus/milvus.module';
import { ChunksplitModule } from 'src/chunksplit/chunksplit.module';
import { ChunkModule } from 'src/chunk/chunk.module';
import { forwardRef } from '@nestjs/common';
import { EmbeddingModule } from 'src/embedding/embedding.module';

@Module({
  imports: [
    MilvusModule,
    ChunksplitModule,
    ChunkModule,
    forwardRef(() => EmbeddingModule),
    TypeOrmModule.forFeature([KnowledgeEntity, DatasetEntity]),
  ],
  providers: [KnowledgeService],
  controllers: [KnowledgeController],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
