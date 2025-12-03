import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { KnowledgeModule } from 'src/knowledge/knowledge.module';
import { QueueService } from './queue.service';

@Module({
  providers: [TaskService, QueueService],
  exports: [TaskService],
  imports: [forwardRef(() => KnowledgeModule)],
})
export class TaskModule {}
