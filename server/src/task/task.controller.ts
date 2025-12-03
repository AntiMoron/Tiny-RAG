import { Controller, Get } from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get('status')
  async getTaskStatus() {
    return await this.taskService.getTaskStatus();
  }

  @Get('create')
  async createSampleTask() {
    const task = await this.taskService.createTask({
      type: 'sync_doc',
      data: {
        type: 'feishu',
        appId: 'cli_a726fcaebbf2d00e',
        appSecret: 'USHeHvUApSipXjFUzWmnwdtZbbKmlTNO',
        docUrl:
          'https://xqs4y94tkg.feishu.cn/docx/G6bldPfBQo7nZ7xM3urcKtCPn5c?from=from_copylink',
      },
    });
    return task;
  }
}
