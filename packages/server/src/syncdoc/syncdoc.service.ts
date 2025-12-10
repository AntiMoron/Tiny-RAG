import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskService } from 'src/task/task.service';
import { In, Repository } from 'typeorm';

@Injectable()
export class SyncdocService {
  constructor(private readonly taskService: TaskService) {}

  async createSyncDoc() {
    await this.taskService.addTask({
      type: 'sync_doc',
      data: {
        type: 'feishu',
        appId: '',
        appSecret: '',
        docUrl: '',
      },
    });
  }
}
