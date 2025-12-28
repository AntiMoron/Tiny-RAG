import { forwardRef, Module } from '@nestjs/common';
import { CompletionService } from './completion.service';
import { CompletionController } from './completion.controller';
import { AiproviderModule } from 'src/aiprovider/aiprovider.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIProviderEntity } from 'src/aiprovider/aiprovider.entity';
import { AnalysisModule } from 'src/analysis/analysis.module';

@Module({
  providers: [CompletionService],
  controllers: [CompletionController],
  imports: [
    AnalysisModule,
    TypeOrmModule.forFeature([AIProviderEntity]),
    forwardRef(() => AiproviderModule),
  ],
  exports: [CompletionService],
})
export class CompletionModule {}
