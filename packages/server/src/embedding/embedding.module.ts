import { Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { forwardRef } from '@nestjs/common';
import { KnowledgeModule } from 'src/knowledge/knowledge.module';
import { AiproviderModule } from 'src/aiprovider/aiprovider.module';

@Module({
  providers: [EmbeddingService],
  imports: [
    forwardRef(() => KnowledgeModule),
    forwardRef(() => AiproviderModule),
  ],
  exports: [EmbeddingService],
})
export class EmbeddingModule {}
