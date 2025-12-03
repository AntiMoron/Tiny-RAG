import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import doc2Markdown from 'feishu2markdown';
import { KnowledgeService } from 'src/knowledge/knowledge.service';
import { TaskBody } from 'src/types/task';
import { QueueService } from './queue.service';
import { ChunksplitService } from 'src/chunksplit/chunksplit.service';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';

@Injectable()
export class TaskService implements OnModuleInit {
  constructor(
    private readonly knowledgeService: KnowledgeService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: WinstonLogger,
    private readonly chunksplitService: ChunksplitService,
    private readonly queueService: QueueService,
  ) {}

  async onModuleInit() {
    // Register the processor so workers will execute tasks.
    await this.queueService.registerProcessor(this.handleTask.bind(this));
  }

  async getTaskStatus() {
    return await this.queueService.getTaskStatus();
  }

  // Public API used by controllers or other services to enqueue work
  async createTask(taskBody: TaskBody) {
    return await this.queueService.addTask(taskBody);
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
      let content = '';
      await doc2Markdown({
        type: type as 'feishu',
        appId,
        appSecret,
        docUrl,
        onDocFinish: (docId, markdown: string) => {
          content = markdown;
        },
      });

      const chunks = await this.chunksplitService.splitChunks(content);
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        await this.createTask({
          type: 'chunkIndex',
          data: { type, appId, appSecret, docUrl: url },
        });
      }
    }
  }
}
