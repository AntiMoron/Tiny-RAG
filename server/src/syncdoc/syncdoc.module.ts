import { Module } from '@nestjs/common';
import { SyncdocService } from './syncdoc.service';
import { TaskService } from 'src/task/task.service';

@Module({
  providers: [SyncdocService],
  exports: [SyncdocService],
  imports: [TaskService],
})
export class SyncdocModule {}
