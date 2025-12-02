import { Module } from '@nestjs/common';
import { ChunkService } from './chunk.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChunkEntity } from './chunk.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChunkEntity])],
  providers: [ChunkService],
  exports: [ChunkService],
})
export class ChunkModule {}
