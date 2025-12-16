import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { DatasetService } from './dataset.service';
import { Dataset } from 'tinyrag-types/dataset';
import checkParams, { checkNotHaveParams } from 'src/util/checkParams';

@Controller('api/dataset')
export class DatasetController {
  constructor(private readonly datasetService: DatasetService) {}

  @Get('/detail/:id')
  async getDetail(@Param('id') id: string) {
    return await this.datasetService.getDatasetById(id);
  }

  @Post('add')
  async createDataset(@Body() body: any) {
    checkParams(body, ['name', 'type', 'embededByProviderId']);
    const datasetName = body.name as string;
    const d = await this.datasetService.getDatasetByName(datasetName);
    if (d) {
      throw new HttpException(
        `Dataset with name ${datasetName} already exists`,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.datasetService.createDataset(body as Dataset);
  }

  @Get('list')
  async listDatasets(): Promise<Dataset[]> {
    const list = await this.datasetService.listDatasets();
    // return list.map((a) => _.omit(a, ['config']));
    return list;
  }

  @Delete('delete/:id')
  async deleteDataset(@Param('id') id: string) {
    await this.datasetService.deleteDataset(id);
  }

  @Get(':datasetId/feishu/getFolderList')
  async getFeishuFolder(@Param('datasetId') datasetId: string) {
    return await this.datasetService.getFeishuFolder(datasetId);
  }

  @Post('update/:datasetId')
  async updateDataset(@Param('datasetId') datasetId: string, @Body() body) {
    checkParams(body, ['name', 'embededByProviderId', 'completeByProviderId']);
    checkNotHaveParams(body, ['createdAt', 'updatedAt']);
    const newDataset = body as Dataset;
    return await this.datasetService.updateDataset(datasetId, newDataset);
  }
}
