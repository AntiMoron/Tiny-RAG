import { Injectable, OnModuleInit } from '@nestjs/common';
import doc2Markdown from 'feishu2markdown';
import { KnowledgeService } from 'src/knowledge/knowledge.service';
import { TaskBody } from 'src/types/task';
import { QueueService } from './queue.service';

@Injectable()
export class TaskService implements OnModuleInit {
  constructor(
    private readonly knowledgeService: KnowledgeService,
    private readonly queueService: QueueService,
  ) {}

  async onModuleInit() {
    // Register the processor so workers will execute tasks.
    await this.queueService.registerProcessor(this.handleTask.bind(this));
  }

  // Public API used by controllers or other services to enqueue work
  async createTask(taskBody: TaskBody) {
    return this.queueService.addTask(taskBody);
  }

  /**
   * Actual task processor executed by worker(s). This function may create
   * additional tasks by calling `createTask`.
   */
  async handleTask(taskBody: TaskBody) {
    const { type: taskType, data } = taskBody;
    if (taskType === 'sync_doc') {
      const { type, appId, appSecret, docUrl } = data;
      // Convert doc -> markdown
      const content = await doc2Markdown({
        type: type as 'feishu',
        appId,
        appSecret,
        docUrl,
      });

      // TODO: persist content into KnowledgeService. Skipping here to avoid
      // tight coupling — implement according to your dataset and embedding flow.

      // Example of generating follow-up tasks: if parsing found links, enqueue more sync
      // (Placeholder — adapt to real parsing logic)
      const foundMoreDocs: string[] = []; // populate from content if needed
      for (const url of foundMoreDocs) {
        await this.createTask({
          type: 'sync_doc',
          data: { type, appId, appSecret, docUrl: url },
        });
      }
    }
  }
}
