import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { DatasetService } from './dataset.service';
import { Dataset } from 'src/types/dataset';
import checkParams from 'src/util/checkParams';

@Controller('dataset')
export class DatasetController {
  constructor(private readonly datasetService: DatasetService) {}

  @Post('create')
  async createDataset(@Body() body) {
    checkParams(body, ['name', 'description']);
    await this.datasetService.createDataset(body as Dataset);
  }

  @Get('list')
  async listDatasets(): Promise<Dataset[]> {
    return await this.datasetService.listDatasets();
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
