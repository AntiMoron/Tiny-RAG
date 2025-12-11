import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AICompletionResponse } from 'tinyrag-types/completion';
import { AiproviderService } from 'src/aiprovider/aiprovider.service';
import handleAIProviderConfiguration from 'src/util/executeAI';

@Injectable()
export class CompletionService {
  constructor(
    @Inject(forwardRef(() => AiproviderService))
    private readonly providerService: AiproviderService,
  ) {}

  async completeById(
    providerId: string,
    prompt: string,
  ): Promise<AICompletionResponse | undefined> {
    const provider = await this.providerService.findOne(providerId);
    if (!provider) {
      throw new Error('No provider found!');
    }
    if (provider.type !== 'completion') {
      throw new Error('Provider is not for AI completion.');
    }
    try {
      const data = await handleAIProviderConfiguration<AICompletionResponse>(
        { ...(provider as any) },
        prompt,
      );
      return data;
    } catch (err) {
      throw new Error(`AI Completion failed: ${(err as Error).message}`);
    }
  }
}
