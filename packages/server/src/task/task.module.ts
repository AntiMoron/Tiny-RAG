import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { KnowledgeModule } from 'src/knowledge/knowledge.module';
import { QueueService } from './queue.service';
import { TaskController } from './task.controller';
import { ChunksplitModule } from 'src/chunksplit/chunksplit.module';
import { ChunkModule } from 'src/chunk/chunk.module';
import { DatasetService } from 'src/dataset/dataset.service';
import { DatasetModule } from 'src/dataset/dataset.module';
import { EmbeddingModule } from 'src/embedding/embedding.module'; 
import { VectorDbModule } from 'src/vector-db/vector-db.module';

@Module({
  providers: [TaskService, QueueService],
  exports: [TaskService],
  imports: [
    forwardRef(() => KnowledgeModule),
    forwardRef(() => DatasetModule),
    ChunksplitModule,
    ChunkModule,
    EmbeddingModule,
    VectorDbModule,
  ],
  controllers: [TaskController],
})
export class TaskModule {}
