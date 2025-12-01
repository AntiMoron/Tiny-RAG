import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiproviderModule } from './aiprovider/aiprovider.module';
import { AIProviderEntity } from './aiprovider/aiprovider.entity';
import { EmbeddingModule } from './embedding/embedding.module';
import { CompletionModule } from './completion/completion.module';
import { ApikeyModule } from './apikey/apikey.module';
import { UserModule } from './user/user.module';
import { ConfigureModule } from './configure/configure.module';
import { WinstonModule } from 'nest-winston';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { DatasetModule } from './dataset/dataset.module';
import * as winston from 'winston';
import { DatasetEntity } from './dataset/dataset.entity';
import { KnowledgeEntity } from './knowledge/knowledge.entity';
import fs from 'fs';

fs.readFileSync('../.env')
  .toString()
  .split('\n')
  .forEach((line) => {
    const [key, value = ''] = line.split('=');
    process.env[key.trim()] = value.trim();
  });

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      username: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'tiny_rag_db',
      entities: [AIProviderEntity, KnowledgeEntity, DatasetEntity],
      synchronize: process.env.TYPEORM_SYNC === 'false' ? false : true,
      // keep logging minimal by default
      logging: false,
    }),
    AiproviderModule,
    EmbeddingModule,
    CompletionModule,
    ApikeyModule,
    UserModule,
    ConfigureModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
