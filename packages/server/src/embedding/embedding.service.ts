import { Injectable } from '@nestjs/common';
import { AIEmbeddingResponse } from 'tinyrag-types/embedding';
import { Inject, forwardRef } from '@nestjs/common';
import { AiproviderService } from 'src/aiprovider/aiprovider.service';
import handleAIProviderConfiguration from 'src/util/executeAI';
import * as stopword from 'stopword';
import * as s from 'segment';
import { AnalysisService } from 'src/analysis/analysis.service';

const segment = new s.Segment();
segment.useDefault();

@Injectable()
export class EmbeddingService {
  constructor(
    @Inject(forwardRef(() => AiproviderService))
    private readonly providerService: AiproviderService,
    private analysisService: AnalysisService,
  ) {}

  async removeStopWords(input: string) {
    if (!input) return '';
    // Replace punctuation (keep letters, numbers, Han characters and spaces)
    const cleaned = input
      // allow ASCII range and common CJK unified ideographs; convert other chars to space
      .replace(
        /[^\u0000-\u007F\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\s]/g,
        ' ',
      )
      // replace common ASCII and CJK punctuation/symbol characters with a space
      .replace(
        /[!\"#\$%&'\(\)\*\+,\-\.\/:;<=>\?@\[\\\]\^_`\{\|\}~，。！？；：、《》「」『』（）【】]/g,
        ' ',
      )
      .replace(/\s+/g, ' ')
      .trim();

    // Tokenize (jieba-js handles Chinese segmentation; English words remain intact)
    let tokens = segment.doSegment(cleaned || '');

    // Lowercase Latin tokens for consistent stopword matching
    tokens = tokens.map((t: { w: string }) =>
      /[A-Za-z0-9]/.test(t.w) ? t.w.toLowerCase() : t.w,
    );

    // Remove stopwords for multiple languages
    const langs = [stopword.eng, stopword.zho, stopword.jpn];
    for (const lang of langs) {
      tokens = await stopword.removeStopwords(tokens, lang);
    }

    // Filter out empty tokens and deduplicate while preserving order
    const seen = new Set<string>();
    const finalTokens: string[] = [];
    for (const t of tokens) {
      const s = (t || '').trim();
      if (!s) continue;
      if (!seen.has(s)) {
        seen.add(s);
        finalTokens.push(s);
      }
    }

    // Return a cleaned string suitable for embedding input
    return finalTokens.join(' ');
  }

  async embedById(
    providerId: string,
    input: string,
    pReason?: 'test',
  ): Promise<AIEmbeddingResponse | undefined> {
    const provider = await this.providerService.findOne(providerId);
    if (!provider) {
      throw new Error('No provider found!');
    }
    if (provider.type !== 'embedding') {
      throw new Error('Provider is not for AI embedding.');
    }
    try {
      const removedInput = await this.removeStopWords(input);
      const start = Date.now();
      const data = await handleAIProviderConfiguration<AIEmbeddingResponse>(
        { ...(provider as any) },
        removedInput,
      );
      const end = Date.now();
      const model = data.model;
      const total = data?.usage?.total_tokens || 0;
      await this.analysisService.recordCall({
        inputTokenCount: total,
        outputTokenCount: 0,
        providerId: provider.id,
        model,
        reason: pReason ?? 'embedding',
        responseTime: end - start,
      });
      return data;
    } catch (err) {
      throw new Error(`AI Embedding failed: ${(err as Error).message}`);
    }
  }
}
