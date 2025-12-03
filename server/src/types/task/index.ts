export interface TaskBodyData {
  type: string;
}

export interface SyncDocTaskBodyData extends TaskBodyData {
  appId: string;
  appSecret: string;
  docUrl: string;
}

export interface ChunkIndexTaskBodyData extends TaskBodyData {
  chunkId: string;
}

export interface TaskBody {
  type: 'sync_doc' | 'chunk_index';
  data: TaskBodyData | SyncDocTaskBodyData | ChunkIndexTaskBodyData;
}
