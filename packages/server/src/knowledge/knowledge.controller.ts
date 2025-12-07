import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { Knowledge } from 'tinyrag-types/knowledge';
import checkParams from 'src/util/checkParams';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('list/:dataset')
  async listKnowledge(@Param('dataset') dataset: string) {
    const list = await this.knowledgeService.listKnowledge(dataset);
    const count = await this.knowledgeService.listKnowledge(dataset);
    return {
      total: count,
      list,
    };
  }

  @Post('add/:dataset')
  async addKnowledge(@Param('dataset') dataset: string, @Body() body) {
    checkParams(body, ['id', 'embededByProviderId', 'content']);
    await this.knowledgeService.insertKnowledge({
      ...body,
      dataset_id: dataset,
    } as Knowledge);
  }
}
