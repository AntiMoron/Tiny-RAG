import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiproviderModule } from './aiprovider/aiprovider.module';
import { AIProviderEntity } from './aiprovider/aiprovider.entity';
import { ApiKeyEntity } from './apikey/apiKey.entity';
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
import { ConfigModule } from '@nestjs/config';
import { ChunksplitModule } from './chunksplit/chunksplit.module';
import { ChunkModule } from './chunk/chunk.module';
import { SyncdocModule } from './syncdoc/syncdoc.module';
import { TaskModule } from './task/task.module';
import { FeishuModule } from './feishu/feishu.module';
import getEnvConfigValue from './util/getEnvConfigValue';
import { ChunkEntity } from './chunk/chunk.entity';
import { VectorDbModule } from './vector-db/vector-db.module';
import { RetrieveModule } from './retrieve/retrieve.module';
import { RedisModule } from './redis/redis.module';
import { UserEntity } from './user/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { LruCacheModule } from './cache/lru-cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    (async (): Promise<DynamicModule> => {
      await ConfigModule.envVariablesLoaded;
      return TypeOrmModule.forRoot({
        type: 'mysql',
        host: getEnvConfigValue('MYSQL_HOST'),
        port: parseInt(getEnvConfigValue('MYSQL_PORT'), 10),
        username: getEnvConfigValue('MYSQL_USER'),
        password: getEnvConfigValue('MYSQL_PASSWORD'),
        database: getEnvConfigValue('MYSQL_DATABASE'),
        entities: [
          AIProviderEntity,
          KnowledgeEntity,
          DatasetEntity,
          ChunkEntity,
          ApiKeyEntity,
          UserEntity,
        ],
        synchronize:
          getEnvConfigValue('TYPEORM_SYNC') === 'false' ? false : true,
        logging: false,
      });
    })(),
    LruCacheModule,
    JwtModule.registerAsync({
      global: true, // 全局生效，无需在其他模块重复导入
      useFactory: () => ({
        secret: getEnvConfigValue('JWT_SECRET'),
        signOptions: {
          // 默认签名配置（可在生成 Token 时覆盖）
          algorithm: 'HS256', // 加密算法（推荐 HS256/RS256）
        },
      }),
    }),
    AuthModule,
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
    ChunksplitModule,
    ChunkModule,
    SyncdocModule,
    TaskModule,
    FeishuModule,
    VectorDbModule,
    RetrieveModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
