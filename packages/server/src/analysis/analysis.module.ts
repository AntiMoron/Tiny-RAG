import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntity } from './analysis.entity';

@Module({
  providers: [AnalysisService],
  exports: [AnalysisService],
  controllers: [AnalysisController],
  imports: [TypeOrmModule.forFeature([LogEntity])],
})
export class AnalysisModule {}
