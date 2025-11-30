import { AIProvider, AIProviderUsage } from "../aiprovider";

export interface AIEmbeddingInput {
  providerId: AIProvider['id'];
  input: string;
}

export interface AIEmbeddingOutput {
  dimension: number;
  result: number[];
}


export interface AIEmbeddingResponse {
  object: string;
  data: AIEmbeddingOutput;
  model: string;
  providerId: AIProvider['id'];
  usage: AIProviderUsage;
}
