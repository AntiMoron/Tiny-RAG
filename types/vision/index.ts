import { AIProvider, AIProviderUsage } from "../aiprovider";

export interface AIVisionInput {
  providerId: AIProvider["id"];
  input: string; // prompt
  image: string; // vision
}

export interface AIVisionOutput {
  result: string;
}

export interface AIVisionResponse {
  object: string;
  data: AIVisionOutput;
  model: string;
  providerId: AIProvider["id"];
  usage: AIProviderUsage;
}
