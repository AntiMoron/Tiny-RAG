import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatasetEntity } from './dataset.entity';
import { Dataset } from 'tinyrag-types/dataset';
import { getDocTaskList } from 'feishu2markdown';
import checkParams from 'src/util/checkParams';
import { HandleDocFolderParams } from 'feishu2markdown/dist/src/doc/type';
import * as _ from 'lodash';

@Injectable()
export class DatasetService {
  constructor(
    @InjectRepository(DatasetEntity)
    private readonly datasetRepo: Repository<DatasetEntity>,
  ) {}

  async getDatasetById(id: string): Promise<DatasetEntity | null> {
    return await this.datasetRepo.findOneBy({ id });
  }

  async getDatasetByName(name: string): Promise<DatasetEntity | null> {
    if(!name) {
      return null;
    }
    return await this.datasetRepo.findOneBy({ name });
  }

  async createDataset(dataset: Dataset): Promise<DatasetEntity> {
    let datasetConfig = dataset.config as any;
    if (datasetConfig && typeof datasetConfig !== 'string') {
      datasetConfig = dataset.config
        ? JSON.stringify(dataset.config)
        : undefined;
    }

    const newDataset = this.datasetRepo.create({
      ...dataset,
      config: datasetConfig,
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

  async updateDataset(
    datasetId: string,
    data: Partial<Omit<DatasetEntity, 'id'>>,
  ): Promise<DatasetEntity> {
    const dataset = await this.datasetRepo.findOneBy({ id: datasetId });
    if (!dataset) {
      throw new Error('Dataset not found');
    }
    Object.assign(dataset, _.omit(data, ['id']));
    return this.datasetRepo.save(dataset);
  }
}
