import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatasetEntity } from './dataset.entity';
import { Dataset } from 'src/types/dataset';

@Injectable()
export class DatasetService {
  constructor(
    @InjectRepository(DatasetEntity)
    private readonly datasetRepo: Repository<DatasetEntity>,
  ) {}

  async createDataset(dataset: Dataset): Promise<DatasetEntity> {
    const newDataset = this.datasetRepo.create(dataset);
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
}
