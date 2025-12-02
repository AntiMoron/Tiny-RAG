import { Injectable } from '@nestjs/common';
import doc2Markdown from 'feishu2markdown';
import { KnowledgeService } from 'src/knowledge/knowledge.service';
import { TaskBody } from 'src/types/task';

@Injectable()
export class TaskService {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  async createTask(taskBody: TaskBody) {
    await this.getFeishuDocContent(taskBody);
  }

  async getFeishuDocContent(taskBody: TaskBody) {
    const { type: taskType, data } = taskBody;
    if (taskType === 'sync_doc') {
      const { type, appId, appSecret, docUrl } = data;
      const content = await doc2Markdown({
        type: type as 'feishu',
        appId,
        appSecret,
        docUrl,
      });
    }
  }
}
