import { Injectable } from '@nestjs/common';

@Injectable()
export class ChunksplitService {
  constructor() {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async splitChunks(text: string): Promise<string[]> {
    return this.basicChunkSplit(text, 512, 10);
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
