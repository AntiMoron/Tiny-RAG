import { AIEmbeddingOutput } from "../embedding";

export interface Chunk {
  id: string;
  embedding?: AIEmbeddingOutput;
  embededByProviderId: string;
  content: string;
  knowledge_id: string;
  dataset_id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ChunkRetrieveResult extends Chunk {
  score: number;
}


export interface ChunkIndex {
  chunk_id: string;
  dataset_id: string;
  knowledge_id: string;
  vector: number[];
}
