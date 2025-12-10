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

/**
 * 1. Get content
 *  1.1 Upload file
 *  1.2 Composing text
 *  1.3 Sync from Cloud docs.
 *      1.3.1 Pick files to sync
 * 2. Chunking
 *  2.1 Upload file
 *      2.1.1 Create chunk tasks
 *  2.2 Composing text
 *      2.2.1 Create chunk tasks
 *  2.3 Sync from Cloud docs.
 *      2.3.1 Create sync and chunk tasks
 * 3. Indexing
 *  3.1 Upload file
 *  3.2 Composing text
 *  3.3 Sync from Cloud docs.
 *      1.3.1 Pick files to sync
 */
export interface KnowledgeTask {
  datasetId: string;
  knowledgeId: string;
  ChooseTask: {
    type: string;
    params: {
      docType?: string;
      docTokens?: string[];
    };
  };
  Chunking: {
    method: string;
  };
  Indexing: {};
}
