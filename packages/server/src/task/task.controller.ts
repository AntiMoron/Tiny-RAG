import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  Post,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { KnowledgeTask, TaskBody } from 'tinyrag-types/task';
import { DatasetService } from 'src/dataset/dataset.service';

@Controller('api/task')
export class TaskController {
  constructor(
    @Inject(forwardRef(() => DatasetService))
    private readonly datasetService: DatasetService,
    private readonly taskService: TaskService,
  ) {}

  @Get('status')
  async getTaskStatus() {
    return await this.taskService.getTaskStatus();
  }

  @Get('status/:id')
  async getTaskStatusById(@Body('id') id: string) {
    return await this.taskService.getTaskStatusById(id);
  }

  @Post('add')
  async addTasks(@Body() d: any) {
    const taskBody = d as unknown as KnowledgeTask;
    const tasks: string[] = [];
    const { ChooseTask, Indexing, Chunking, datasetId } = taskBody;
    const dataset = await this.datasetService.getDatasetById(datasetId);
    if (!dataset) {
      throw new Error('Dataset not found');
    }
    const config = dataset.config;
    if (!config) {
      throw new Error('Error');
    }
    const { doc } = config;
    if (ChooseTask.type === 'feishu') {
      const { docTokens = [] } = ChooseTask.params;
      if (!doc?.appId && !doc?.appSecret) {
        throw new Error('Feishu token not found in dataset config');
      }
      if (!docTokens || docTokens.length === 0) {
        throw new Error('No docTokens provided for Feishu task');
      }
      // fetch
      for (let i = 0; i < docTokens.length; i++) {
        const token = docTokens[i];
        const fetchTask: TaskBody = {
          type: 'sync_doc',
          data: {
            type: ChooseTask.type,
            appId: doc?.appId || '',
            appSecret: doc?.appSecret || '',
            datasetId,
            knowledge_id: token,
            docToken: ChooseTask.params.docType === 'docx' ? token : '',
          } as TaskBody['data'],
        };
        const job = await this.taskService.addTask(fetchTask);
        if (job) {
          tasks.push(job.id!);
        }
      }
    }
    return tasks;
  }
}
