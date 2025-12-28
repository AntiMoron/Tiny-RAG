import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AICompletionResponse } from 'tinyrag-types/completion';
import { AiproviderService } from 'src/aiprovider/aiprovider.service';
import handleAIProviderConfiguration from 'src/util/executeAI';
import { AnalysisService } from 'src/analysis/analysis.service';

@Injectable()
export class CompletionService {
  constructor(
    @Inject(forwardRef(() => AiproviderService))
    private readonly providerService: AiproviderService,
    private readonly analysisService: AnalysisService,
  ) {}

  async completeById(
    providerId: string,
    prompt: string,
    pReason?: 'test',
  ): Promise<AICompletionResponse | undefined> {
    const provider = await this.providerService.findOne(providerId);
    if (!provider) {
      throw new HttpException('Provider not found', HttpStatus.NOT_FOUND);
    }
    if (provider.type !== 'completion') {
      throw new HttpException(
        'Provider is not for AI completion.',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const start = Date.now();
      const data = await handleAIProviderConfiguration<AICompletionResponse>(
        { ...(provider as any) },
        prompt,
      );
      const end = Date.now();
      const model = data.model;
      const inputTokens = data?.usage?.prompt_tokens || 0;
      const outputTokens = data?.usage?.completion_tokens || 0;
      await this.analysisService.recordCall({
        providerId: provider.id,
        model,
        inputTokenCount: inputTokens,
        outputTokenCount: outputTokens,
        responseTime: end - start,
        reason: pReason ?? 'completion',
      });

      return data;
    } catch (err) {
      throw new Error(`AI Completion failed: ${(err as Error).message}`);
    }
  }
}
