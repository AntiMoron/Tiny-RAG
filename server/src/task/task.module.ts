import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { KnowledgeModule } from 'src/knowledge/knowledge.module';
import { QueueService } from './queue.service';
import { TaskController } from './task.controller';
import { ChunksplitModule } from 'src/chunksplit/chunksplit.module';

@Module({
  providers: [TaskService, QueueService],
  exports: [TaskService],
  imports: [forwardRef(() => KnowledgeModule), ChunksplitModule],
  controllers: [TaskController],
})
export class TaskModule {}
