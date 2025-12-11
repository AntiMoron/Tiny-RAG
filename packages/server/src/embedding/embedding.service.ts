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

  async retriveKnowledgeById(
    providerId: string,
    datasetId: string,
    prompt: string,
  ): Promise<(Knowledge & { score: number })[]> {
    const questionEmbed = await this.embedById(providerId, prompt);
    const similarityThreshold = 0.75;
    if (!questionEmbed?.data.result) {
      throw new Error('Failed to get embedding for the prompt.');
    }
    const results = await this.knowledgeService.findSimilarKnowledge(
      datasetId,
      questionEmbed.data.result,
    );

    const newResult = results
      .map((item) => ({
        ...item,
        score: item.score,
      }))
      .filter((item) => item.score >= similarityThreshold);
    const knowledge_ids = newResult.map((item) => item.knowledge_id);
    const knowledges = await this.knowledgeService.findByIds(knowledge_ids);
    return knowledges.map((k) => {
      const score =
        newResult.find((item) => item.knowledge_id === k.id)?.score || 0;
      return {
        ...k,
        score,
      };
    });
  }
}
