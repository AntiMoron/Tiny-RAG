export interface Dataset {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  embededByProviderId: string;
  type: 'text' | 'feishu';
  config?: {
    doc?: {
      appId: string;
      appSecret: string;
      folderToken?: string;
      docUrl?: string;
      type: string; // feishu | google
    };
  };
}
