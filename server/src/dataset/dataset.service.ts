import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatasetEntity } from './dataset.entity';

@Injectable()
export class DatasetService {
  constructor(
    @InjectRepository(DatasetEntity)
    private readonly datasetRepo: Repository<DatasetEntity>,
  ) {}

  
}
