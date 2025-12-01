export interface Dataset {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  type: 'text' | 'feishu';
}
