import { Module } from '@nestjs/common';
import { SyncdocService } from './syncdoc.service';
import { TaskModule } from 'src/task/task.module';

@Module({
  providers: [SyncdocService],
  exports: [SyncdocService],
  imports: [TaskModule],
})
export class SyncdocModule {}
