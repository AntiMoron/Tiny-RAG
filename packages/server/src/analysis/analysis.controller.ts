import { Controller, Get } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller('api/analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('completion-trend')
  async getCompletionTrend() {
    return await this.analysisService.getCompletionTrend();
  }

  @Get('token-usage')
  async getTokenUsageTrend() {
    return await this.analysisService.getTokenUsageTrend();
  }

  @Get('response-time')
  async getResponseTimeTrend() {
    return await this.analysisService.getResponseTimeTrend();
  }

  @Get('model-usage')
  async getModelUsageTrend() {
    return await this.analysisService.getModelUsageTrend();
  }
}
