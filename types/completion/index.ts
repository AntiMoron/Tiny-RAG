import { AIProvider, AIProviderUsage } from "../aiprovider";

export interface AICompletionInput {
  providerId: AIProvider["id"];
  input: string;
}

export interface AICompletionOutput {
  result: string;
}

export interface AICompletionResponse {
  object: string;
  data: AICompletionOutput;
  model: string;
  providerId: AIProvider["id"];
  usage: AIProviderUsage;
}
