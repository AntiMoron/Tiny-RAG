import { AIEmbeddingOutput } from '../embedding';

export interface Chunk {
  id: string;
  embedding?: AIEmbeddingOutput;
  embededByProviderId: string;
  content: string;
  knowledge_id: string;
  dataset_id: string;
  createdAt: Date;
  updatedAt: Date;
}
