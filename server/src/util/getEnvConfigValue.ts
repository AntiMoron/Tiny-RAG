const defaultValues: Record<string, string> = {
  MYSQL_HOST: 'localhost',
  MYSQL_PORT: '3306',
  MYSQL_USER: 'root',
  MYSQL_PASSWORD: '',
  MYSQL_DATABASE: 'tiny_rag_db',
  MILVUS_ADDR: 'localhost:19530',
  MILVUS_COLLECTION_USER_NAME: '',
  MILVUS_COLLECTION_PASSWORD: '',
  REDIS_URL: 'redis://127.0.0.1:6379',
  TASK_WORKER_CONCURRENCY: '1',
  TASK_QUEUE_NAME: 'tasks',
  IN_MEMORY_MAX_QUEUE_SIZE: '1000',
};

export default function getEnvConfigValue(key: string): string {
  return process.env[key] || defaultValues[key] || '';
}
