import embedding from './embedding';
import completion from './completion';
import { AIProvider } from 'src/types/aiprovider';

export default function getDefaultConfig(
  type: AIProvider['type'],
  key: string,
): AIProvider {
  if (type === 'embedding') {
    return embedding[key] as AIProvider;
  } else if (type === 'completion') {
    return completion[key] as AIProvider;
  }
  throw new Error(`Unsupported type: ${type}`);
}
