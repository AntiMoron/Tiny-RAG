import { Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { EmbeddingController } from './embedding.controller';
import { forwardRef } from '@nestjs/common';
import { KnowledgeModule } from 'src/knowledge/knowledge.module';

@Module({
  providers: [EmbeddingService],
  controllers: [EmbeddingController],
  imports: [forwardRef(() => KnowledgeModule)],
  exports: [EmbeddingService],
})
export class EmbeddingModule {}
