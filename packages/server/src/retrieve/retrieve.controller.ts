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
import { CompletionService } from 'src/completion/completion.service';
import { RETRIEVE_TEST_PROMPT } from 'src/util/prompts';
import * as _ from 'lodash';
import { Public } from 'src/util/public.decorator';
import { TinyRAGAPI } from 'src/util/api.decorator';

@Controller('api/retrieve')
export class RetrieveController {
  constructor(
    private readonly retrieveService: RetrieveService,
    private readonly datasetService: DatasetService,
    private readonly completionService: CompletionService,
  ) {}

  @Public()
  @TinyRAGAPI()
  @Post('dataset/:datasetId/retrieve/export')
  async datasetRetrieveExport(
    @Param('datasetId') datasetId: string,
    @Body() body,
  ) {
    checkParams(body, ['question']);
    const dataset = await this.datasetService.getDatasetById(datasetId);
    if (!dataset) {
      throw new HttpException(`Dataset not found`, HttpStatus.NOT_FOUND);
    }
    const { question } = body;
    const data = await this.retrieveService.retieveEmbeddingData(
      dataset,
      question as string,
      3,
    );
    const validData = data.map((item) => _.pick(item, ['score', 'content']));
    return {
      validData,
    };
  }

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
    const data = await this.retrieveService.retieveEmbeddingData(
      dataset,
      question as string,
      3,
    );
    const validData = data.map((item) => _.pick(item, ['score', 'content']));
    const replyPrompt = RETRIEVE_TEST_PROMPT.replace(
      '{{context}}',
      JSON.stringify(validData, null, 2),
    ).replace('{{question}}', question as string);
    const completion = await this.completionService.completeById(
      dataset.completeByProviderId,
      replyPrompt,
    );
    return {
      validData,
      replyPrompt,
      completion: completion?.data?.result,
    };
  }
}
