export interface AIProvider {
  id: string;
  name: string;
  config: AIProviderConfig;
  type: 'embedding' | 'completion' | 'vision';
}

export interface AIProviderUsage {
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
}

export interface AIProviderConfig {
  apiKey: string;
  endpoint: string;
  headers: any;
  method: 'GET' | 'POST';
  region?: string;
  paramMapping: Record<string, string>; // e.g. 'prompt' => 'input.text'
  resultMapping: Record<string, string>; // e.g. 'data.choices[0].text' => 'text'
}
