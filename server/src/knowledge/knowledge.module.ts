import { Module } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeController } from './knowledge.controller';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { KnowledgeEntity } from './knowledge.entity';
import { DatasetEntity } from 'src/dataset/dataset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeEntity, DatasetEntity])],
  providers: [KnowledgeService],
  controllers: [KnowledgeController],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
