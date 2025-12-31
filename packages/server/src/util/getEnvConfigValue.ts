import * as os from 'os';

const defaultValues: Record<string, string> = {
  ADMIN_NAME: 'admin',
  ADMIN_PASSWORD: 'ilovetinyrag',
  JWT_SECRET: 'tinyrag',
  PUBLIC_HOST: 'http://localhost:3000',
  JWT_ACCESS_TOKEN_EXPIRES_IN: '3600s',

  DATABASE_TYPE: 'mysql',

  TYPEORM_SYNC: '',
  MYSQL_HOST: 'localhost',
  MYSQL_PORT: '3306',
  MYSQL_USER: 'root',
  MYSQL_PASSWORD: '',
  MYSQL_DATABASE: 'tiny_rag_db',

  VECTOR_DB_TYPE: 'milvus',

  //----MILVUS_START-----//
  MILVUS_ADDR: 'localhost:19530',
  MILVUS_CHUNK_COLLECTION_NAME: 'chunks',
  MILVUS_COLLECTION_USER_NAME: '',
  MILVUS_COLLECTION_PASSWORD: '',
  //----MILVUS_END-----//

  //--- REDIS_START-----//
  REDIS_URL: 'redis://127.0.0.1:6379',
  REDIS_PASSWORD: '',
  REDIS_DB: '0',
  //--- REDIS_END-----//

  //---LRU_CACHE_START---//
  LRU_CACHE_MAX: '5000',
  LRU_CACHE_TTL_MS: '60000',

  //---LRU_CACHE_END---//

  TASK_QUEUE_TYPE: 'redis',
  TASK_WORKER_CONCURRENCY: `${Math.max(1, os.cpus().length - 1) || '1'}`,
  TASK_QUEUE_NAME: 'tasks',
  IN_MEMORY_MAX_QUEUE_SIZE: '1000',
};

export default function getEnvConfigValue(key: string): string {
  return process.env[key] || defaultValues[key] || '';
}
