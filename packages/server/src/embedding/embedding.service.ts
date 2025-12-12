import { Injectable } from '@nestjs/common';
import { AIEmbeddingResponse } from 'tinyrag-types/embedding';
import * as _ from 'lodash';
import { Knowledge } from 'tinyrag-types/knowledge';
import { KnowledgeService } from 'src/knowledge/knowledge.service';
import { Inject, forwardRef } from '@nestjs/common';
import { AiproviderService } from 'src/aiprovider/aiprovider.service';
import handleAIProviderConfiguration from 'src/util/executeAI';

@Injectable()
export class EmbeddingService {
  constructor(
    @Inject(forwardRef(() => AiproviderService))
    private readonly providerService: AiproviderService,
    @Inject(forwardRef(() => KnowledgeService))
    private readonly knowledgeService: KnowledgeService,
  ) {}

  async embedById(
    providerId: string,
    input: string,
  ): Promise<AIEmbeddingResponse | undefined> {
    const provider = await this.providerService.findOne(providerId);
    if (!provider) {
      throw new Error('No provider found!');
    }
    if (provider.type !== 'embedding') {
      throw new Error('Provider is not for AI embedding.');
    }
    try {
      const data = await handleAIProviderConfiguration<AIEmbeddingResponse>(
        { ...(provider as any) },
        input,
      );
      return data;
    } catch (err) {
      throw new Error(`AI Embedding failed: ${(err as Error).message}`);
    }
  }
}
