import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { DatasetService } from './dataset.service';
import { Dataset } from 'tinyrag-types/dataset';
import checkParams from 'src/util/checkParams';
import * as _ from 'lodash';

@Controller('api/dataset')
export class DatasetController {
  constructor(private readonly datasetService: DatasetService) {}

  @Post('add')
  async createDataset(@Body() body) {
    checkParams(body, ['name', 'type', 'embededByProviderId']);
    await this.datasetService.createDataset(body as Dataset);
  }

  @Get('list')
  async listDatasets(): Promise<Dataset[]> {
    const list = await this.datasetService.listDatasets();
    return list.map((a) => _.omit(a, ['config']));
  }

  @Delete('delete/:id')
  async deleteDataset(@Param('id') id: string) {
    await this.datasetService.deleteDataset(id);
  }

  @Get(':datasetId/feishu/getFolderList')
  async getFeishuFolder(@Param('datasetId') datasetId: string) {
    return await this.datasetService.getFeishuFolder(datasetId);
  }
}
