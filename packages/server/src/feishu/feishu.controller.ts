import {
  Controller,
  forwardRef,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
} from '@nestjs/common';
import { DatasetService } from 'src/dataset/dataset.service';
import checkParams from 'src/util/checkParams';
import { Knowledge } from 'tinyrag-types/knowledge';
import { getDocTaskList } from 'feishu2markdown';
import parseJSON from 'src/util/parseJSON';
import { DatasetConfig } from 'tinyrag-types/dataset';

@Controller('api/feishu')
export class FeishuController {
  constructor(
    @Inject(forwardRef(() => DatasetService))
    private readonly datasetService: DatasetService,
  ) {}

  @Get('dataset/:datasetId/tasks')
  async listFeishuKnowledge(
    @Param('datasetId') datasetId: string,
  ): Promise<Knowledge[]> {
    const datasetEntity = await this.datasetService.getDatasetById(datasetId);
    if (!datasetEntity) {
      throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);
    }
    const { type, config } = datasetEntity;
    if (type !== 'feishu') {
      throw new HttpException(
        'Dataset type is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!config) {
      throw new HttpException(
        'Dataset type is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      checkParams(config, ['doc']);
      checkParams(config?.doc, ['appId', 'appSecret', 'folderToken']);
    }
    const { appId, appSecret, folderToken } = config.doc!;
    const tasks = await getDocTaskList({
      type: 'feishu',
      appId,
      appSecret,
      folderToken,
    } as any);
    return tasks as any[];
  }
}
