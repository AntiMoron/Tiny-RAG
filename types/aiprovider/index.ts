export interface AIProvider {
  id: string;
  name: string;
  config: AIProviderConfig;
}

export interface AIProviderUsage {
  prompt_tokens: number;
  total_tokens: number;
}

export interface AIProviderConfig {
  apiKey: string;
  endpoint: string;
  region?: string;
  resultMapping: string;
  usage: "embedding" | "completion" | "vision";
}
