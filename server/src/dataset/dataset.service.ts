import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatasetEntity } from './dataset.entity';
import { Dataset } from 'src/types/dataset';
import { getDocTaskList } from 'feishu2markdown';
import checkParams from 'src/util/checkParams';
import { HandleDocFolderParams } from 'feishu2markdown/dist/src/doc/type';

@Injectable()
export class DatasetService {
  constructor(
    @InjectRepository(DatasetEntity)
    private readonly datasetRepo: Repository<DatasetEntity>,
  ) {}

  async createDataset(dataset: Dataset): Promise<DatasetEntity> {
    const newDataset = this.datasetRepo.create({
      ...dataset,
      config: dataset.config ? JSON.stringify(dataset.config) : undefined,
    });
    return this.datasetRepo.save(newDataset);
  }

  async listDatasets(): Promise<Dataset[]> {
    return (await this.datasetRepo.find()) as Dataset[];
  }

  async deleteDataset(id: string): Promise<void> {
    const data = await this.datasetRepo.findOneBy({ id });
    if (!data) {
      throw new Error('Dataset not found');
    }
    await this.datasetRepo.delete(id);
  }

  async getFeishuFolder(datasetId: string) {
    const dataset = await this.datasetRepo.findOneBy({ id: datasetId });
    if (!dataset) {
      throw new Error('Dataset not found');
    }
    let config: Dataset['config'];
    if (typeof dataset.config === 'string') {
      try {
        config = JSON.parse(dataset.config) as unknown as Dataset['config'];
      } catch {
        throw new Error(`config incorrect for dataset<${datasetId}>`);
      }
    }
    const docConfig = config?.doc;
    if (!docConfig) {
      throw new Error('Dataset incorrect.');
    }
    const { appId, appSecret, folderToken } = docConfig;
    checkParams(docConfig, ['appId', 'appSecret']);
    const list = await getDocTaskList({
      appId,
      appSecret,
      folderToken,
      type: 'feishu',
    } as HandleDocFolderParams);
    return list as Array<{
      name: string;
      url: string;
      type: string;
      token: string;
      id: string;
    }>;
  }
}
