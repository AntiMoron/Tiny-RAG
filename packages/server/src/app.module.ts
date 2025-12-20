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
import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { JwtAuthGuard } from './auth/auth.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
// import * as sqlite3 from 'better-sqlite3';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    (async (): Promise<DynamicModule> => {
      await ConfigModule.envVariablesLoaded;
      const entities = [
        AIProviderEntity,
        KnowledgeEntity,
        DatasetEntity,
        ChunkEntity,
        ApiKeyEntity,
        UserEntity,
      ];
      const databaseType = getEnvConfigValue('DATABASE_TYPE');
      const sqliteFilePath = getEnvConfigValue('SQLITE_FILE_PATH');
      const synchronize =
        getEnvConfigValue('TYPEORM_SYNC') === 'false' ? false : true;
      switch (databaseType) {
        case 'sqlite':
          return TypeOrmModule.forRoot({
            type: 'better-sqlite3',
            database: sqliteFilePath,
            entities,
            // driver: sqlite3,
            synchronize,
            logging: false,
          });
        case 'mysql':
          return TypeOrmModule.forRoot({
            type: 'mysql',
            host: getEnvConfigValue('MYSQL_HOST'),
            port: parseInt(getEnvConfigValue('MYSQL_PORT'), 10),
            username: getEnvConfigValue('MYSQL_USER'),
            password: getEnvConfigValue('MYSQL_PASSWORD'),
            database: getEnvConfigValue('MYSQL_DATABASE'),
            entities,
            synchronize,
            logging: false,
          });
        default:
          throw new Error(`Unsupported DATABASE_TYPE: ${databaseType}`);
      }
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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public/',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
