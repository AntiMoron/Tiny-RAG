import embedding from './embedding';
import completion from './completion';
import { AIProvider } from 'src/types/aiprovider';

export default function getDefaultConfig(
  type: AIProvider['type'],
  key: string,
): AIProvider {
  if (type === 'embedding') {
    return embedding[key];
  } else if (type === 'completion') {
    return completion[key];
  }
  throw new Error(`Unsupported type: ${type}`);
}
