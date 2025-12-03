import * as os from 'os';

const defaultValues: Record<string, string> = {
  TYPEORM_SYNC: '',
  MYSQL_HOST: 'localhost',
  MYSQL_PORT: '3306',
  MYSQL_USER: 'root',
  MYSQL_PASSWORD: '',
  MYSQL_DATABASE: 'tiny_rag_db',
  MILVUS_ADDR: 'localhost:19530',
  MILVUS_CHUNK_COLLECTION_NAME: 'chunks',
  MILVUS_COLLECTION_USER_NAME: '',
  MILVUS_COLLECTION_PASSWORD: '',
  TASK_QUEUE_TYPE: 'redis',
  REDIS_URL: 'redis://127.0.0.1:6379',
  TASK_WORKER_CONCURRENCY: `${Math.max(1, os.cpus().length - 1) || '1'}`,
  TASK_QUEUE_NAME: 'tasks',
  IN_MEMORY_MAX_QUEUE_SIZE: '1000',
};

export default function getEnvConfigValue(key: string): string {
  return process.env[key] || defaultValues[key] || '';
}
