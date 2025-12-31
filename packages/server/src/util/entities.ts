import { AIProviderEntity } from 'src/aiprovider/aiprovider.entity';
import { LogEntity } from 'src/analysis/analysis.entity';
import { ApiKeyEntity } from 'src/apikey/apiKey.entity';
import { ChunkEntity } from 'src/chunk/chunk.entity';
import { DatasetEntity } from 'src/dataset/dataset.entity';
import { KnowledgeEntity } from 'src/knowledge/knowledge.entity';
import { UserEntity } from 'src/user/user.entity';

const entities = [
  AIProviderEntity,
  KnowledgeEntity,
  DatasetEntity,
  ChunkEntity,
  ApiKeyEntity,
  UserEntity,
  LogEntity,
];

export default entities;
