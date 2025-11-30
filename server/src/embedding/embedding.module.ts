import { Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { EmbeddingController } from './embedding.controller';
import { KnowledgeModule } from 'src/knowledge/knowledge.module';

@Module({
  providers: [EmbeddingService],
  controllers: [EmbeddingController],
  imports: [KnowledgeModule]
})
export class EmbeddingModule {}
