import { Module } from '@nestjs/common';
import { RetrieveService } from './retrieve.service';
import { EmbeddingModule } from 'src/embedding/embedding.module';
import { VectorDbModule } from 'src/vector-db/vector-db.module';
import { ChunkModule } from 'src/chunk/chunk.module';
import { RetrieveController } from './retrieve.controller';
import { DatasetModule } from 'src/dataset/dataset.module';
import { CompletionModule } from 'src/completion/completion.module';

@Module({
  providers: [RetrieveService],
  exports: [RetrieveService],
  imports: [
    EmbeddingModule,
    VectorDbModule,
    ChunkModule,
    DatasetModule,
    CompletionModule,
  ],
  controllers: [RetrieveController],
})
export class RetrieveModule {}
