import { Module } from '@nestjs/common';
import { ChunksplitService } from './chunksplit.service';

/**
 * Here's the best practices that I will follow. FYI:
 * https://www.pinecone.io/learn/chunking-strategies/
 */
@Module({
  providers: [ChunksplitService],
  exports: [ChunksplitService],
})
export class ChunksplitModule {}
