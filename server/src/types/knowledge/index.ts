import { AIEmbeddingOutput } from '../embedding';

export interface Knowledge {
  id: string;
  embededByProviderId: string;
  embedding?: AIEmbeddingOutput;
  content: string;
  dataset_id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeIndex {
  dataset_id: string;
  knowledge_id: string;
  vector: number[];
  score: number;
}
