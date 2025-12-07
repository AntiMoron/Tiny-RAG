import {
  Body,
  Controller,
  forwardRef,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { Knowledge } from 'tinyrag-types/knowledge';
import checkParams from 'src/util/checkParams';
import { DatasetService } from 'src/dataset/dataset.service';

@Controller('api/knowledge')
export class KnowledgeController {
  constructor(
    @Inject(forwardRef(() => DatasetService))
    private readonly datasetService: DatasetService,
    private readonly knowledgeService: KnowledgeService,
  ) {}

  @Get('list/:dataset')
  async listKnowledge(@Param('dataset') dataset: string) {
    const list = await this.knowledgeService.listKnowledge(dataset);
    const count = await this.knowledgeService.getKnowledgeCount(dataset);
    return {
      total: count,
      list,
    };
  }

  @Post('add')
  async addKnowledge(@Body() body) {
    checkParams(body, ['dataset_id', 'embededByProviderId', 'content']);
    await this.knowledgeService.insertKnowledge({
      ...body,
    } as Knowledge);
  }

}
