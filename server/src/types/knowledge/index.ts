export interface Knowledge {
  id: string;
  content: string;
  dataset_id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeIndex {
  dataset_id: string;
  knowledge_id: string;
  vector: number[];
  score: number;
}
