import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { KnowledgeModule } from 'src/knowledge/knowledge.module';

@Module({
  providers: [TaskService],
  exports: [TaskService],
  imports: [KnowledgeModule],
})
export class TaskModule {}
