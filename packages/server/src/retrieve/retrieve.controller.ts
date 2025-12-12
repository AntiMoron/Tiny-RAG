import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { RetrieveService } from './retrieve.service';
import { DatasetService } from 'src/dataset/dataset.service';
import checkParams from 'src/util/checkParams';
import { Dataset } from 'tinyrag-types/dataset';
import { CompletionService } from 'src/completion/completion.service';
import { RETRIEVE_TEST_PROMPT } from 'src/util/prompts';

@Controller('api/retrieve')
export class RetrieveController {
  constructor(
    private readonly retrieveService: RetrieveService,
    private readonly datasetService: DatasetService,
    private readonly completionService: CompletionService,
  ) {}

  @Post('dataset/:datasetId/retrieve/test')
  async datasetRetrieveTest(
    @Param('datasetId') datasetId: string,
    @Body() body,
  ) {
    checkParams(body, ['question']);
    const dataset = await this.datasetService.getDatasetById(datasetId);
    if (!dataset) {
      throw new HttpException(`Dataset not found`, HttpStatus.NOT_FOUND);
    }
    const { question } = body;
    const datas = await this.retrieveService.retieveEmbeddingData(
      dataset as Dataset,
      question as string,
      3,
    );
    const replyPrompt = RETRIEVE_TEST_PROMPT.replace('{{context}}', '').replace(
      '{{question}}',
      question as string,
    );
    const completion = await this.completionService.completeById(
      dataset.completeByProviderId,
      replyPrompt,
    );
    return {
      datas,
      completion: completion?.data?.result,
    };
  }
}
