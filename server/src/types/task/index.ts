export interface TaskBodyData {
  type: string;
}

export interface SyncDocTaskBodyData extends TaskBodyData {
  appId: string;
  appSecret: string;
  datasetId: string;
  docUrl: string;
}

export interface ChunkIndexTaskBodyData extends TaskBodyData {
  chunkId: string;
}

export interface ChunkLastIndexTaskBodyData extends ChunkIndexTaskBodyData {
  knowledge_id: string;
}

export interface TaskBody {
  type: 'sync_doc' | 'chunk_index' | 'chunk_last_index';
  data: TaskBodyData | SyncDocTaskBodyData | ChunkIndexTaskBodyData | ChunkLastIndexTaskBodyData;
}
