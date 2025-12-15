import { Injectable } from '@nestjs/common';
import { chunk } from 'llm-chunk';
import { MarkdownTextSplitter } from '@langchain/textsplitters';

@Injectable()
export class ChunksplitService {
  constructor() {}

  private markdownSplitter = new MarkdownTextSplitter();

  // eslint-disable-next-line @typescript-eslint/require-await
  async splitChunks(text: string, type?: string): Promise<string[]> {
    if (type === 'simple') {
      return this.basicChunkSplit(text, 512, 10);
    }
    if (type === 'llm-chunk') {
      return chunk(text);
    }
    return this.markdownSplitter.splitText(text);
  }

  private basicChunkSplit(
    text: string,
    chunkSize: number,
    overlapSize: number,
  ) {
    const chunks: string[] = [];
    let start = 0;
    const textLength = text.length;

    while (start < textLength) {
      const end = Math.min(start + chunkSize, textLength);
      const chunk = text.slice(start, end);
      chunks.push(chunk);
      start += chunkSize - overlapSize;
    }

    return chunks;
  }
}
