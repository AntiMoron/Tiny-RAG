import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiproviderModule } from './aiprovider/aiprovider.module';
import { AIProviderEntity } from './aiprovider/aiprovider.entity';
import { EmbeddingModule } from './embedding/embedding.module';
import { CompletionModule } from './completion/completion.module';
import { ApikeyModule } from './apikey/apikey.module';
import { UserModule } from './user/user.module';
import { WinstonModule } from 'nest-winston';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { DatasetModule } from './dataset/dataset.module';
import * as winston from 'winston';
import { DatasetEntity } from './dataset/dataset.entity';
import { KnowledgeEntity } from './knowledge/knowledge.entity';
import { MilvusModule } from './milvus/milvus.module';
import { ConfigModule } from '@nestjs/config';
import { ChunksplitModule } from './chunksplit/chunksplit.module';
import { ChunkModule } from './chunk/chunk.module';
import { SyncdocModule } from './syncdoc/syncdoc.module';
import { SsService } from './ss/ss.service';
import { TaskModule } from './task/task.module';

const defaultValues: Record<string, string> = {
  MYSQL_HOST: 'localhost',
  MYSQL_PORT: '3306',
  MYSQL_USER: 'root',
  MYSQL_PASSWORD: '',
  MYSQL_DATABASE: 'tiny_rag_db',
  MILVUS_ADDR: 'localhost:19530',
  MILVUS_COLLECTION_USER_NAME: '',
  MILVUS_COLLECTION_PASSWORD: '',
};

function getEnvConfigValue(key: string): string {
  return process.env[key] || defaultValues[key] || '';
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    (async (): Promise<DynamicModule> => {
      // const defaultConfiguration = await configuration();
      await ConfigModule.envVariablesLoaded;
      return TypeOrmModule.forRoot({
        type: 'mysql',
        host: getEnvConfigValue('MYSQL_HOST'),
        port: parseInt(getEnvConfigValue('MYSQL_PORT'), 10),
        username: getEnvConfigValue('MYSQL_USER'),
        password: getEnvConfigValue('MYSQL_PASSWORD'),
        database: getEnvConfigValue('MYSQL_DATABASE'),
        entities: [AIProviderEntity, KnowledgeEntity, DatasetEntity],
        synchronize:
          getEnvConfigValue('TYPEORM_SYNC') === 'false' ? false : true,
        // keep logging minimal by default
        logging: false,
      });
    })(),
    AiproviderModule,
    EmbeddingModule,
    CompletionModule,
    ApikeyModule,
    UserModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            winston.format.prettyPrint(),
          ),
        }),
      ],
    }),
    KnowledgeModule,
    DatasetModule,
    MilvusModule,
    ChunksplitModule,
    ChunkModule,
    SyncdocModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService, SsService],
})
export class AppModule {}
