export interface TaskBodyData {
  type: string;
  appId: string;
  appSecret: string;
  docUrl: string;
}

export interface TaskBody {
  type: 'sync_doc';
  data: TaskBodyData;
}
