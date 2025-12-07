import { Module } from '@nestjs/common';
import { CompletionService } from './completion.service';
import { CompletionController } from './completion.controller';
import { AiproviderModule } from 'src/aiprovider/aiprovider.module';
import { AiproviderService } from 'src/aiprovider/aiprovider.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIProviderEntity } from 'src/aiprovider/aiprovider.entity';

@Module({
  providers: [CompletionService, AiproviderService],
  controllers: [CompletionController],
  imports: [AiproviderModule, TypeOrmModule.forFeature([AIProviderEntity])],
})
export class CompletionModule {}
