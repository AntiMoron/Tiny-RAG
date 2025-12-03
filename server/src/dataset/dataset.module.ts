import { Module } from '@nestjs/common';
import { DatasetService } from './dataset.service';
import { DatasetController } from './dataset.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatasetEntity } from './dataset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DatasetEntity])],
  providers: [DatasetService],
  controllers: [DatasetController],
  exports: [DatasetService],
})
export class DatasetModule {}
