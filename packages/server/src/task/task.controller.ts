import {
  Body,
  Controller,
  forwardRef,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { KnowledgeTask, TaskBody } from 'tinyrag-types/task';
import { DatasetService } from 'src/dataset/dataset.service';
import { KnowledgeService } from 'src/knowledge/knowledge.service';

@Controller('api/task')
export class TaskController {
  constructor(
    @Inject(forwardRef(() => DatasetService))
    private readonly datasetService: DatasetService,
    private readonly taskService: TaskService,
    private readonly knowledgeService: KnowledgeService,
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
      throw new HttpException('Dataset config not found', HttpStatus.NOT_FOUND);
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
        let knowledgeEntity =
          await this.knowledgeService.findByExternalId(token);
        if (!knowledgeEntity) {
          knowledgeEntity = await this.knowledgeService.insertKnowledge({
            externalId: token,
            content: '',
            dataset_id: datasetId,
            indexStatus: 'pending',
          });
        } else {
          await this.knowledgeService.updateKnowledgeIndexStatus(
            knowledgeEntity.id,
            'pending',
          );
        }

        const fetchTask: TaskBody = {
          type: 'sync_doc',
          data: {
            type: ChooseTask.type,
            appId: doc?.appId || '',
            appSecret: doc?.appSecret || '',
            datasetId,
            knowledge_id: knowledgeEntity.id,
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
