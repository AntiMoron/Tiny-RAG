import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogEntity } from './analysis.entity';
import formatDate from 'src/util/sqlDb/formatDate';

@Injectable()
/**
 * 1. Trend of total number of completions per hour
 * 2. Trend of total tokens used per hour
 * 3. Trend of average response time per hour
 * 4. Trend of model usage per hour
 */
export class AnalysisService {
  constructor(
    @InjectRepository(LogEntity)
    private readonly logRepository: Repository<LogEntity>,
  ) {}

  /**
   * Get trend of total number of completions per hour
   */
  async getCompletionTrend(): Promise<{ hour: string; count: number }[]> {
    return this.logRepository
      .createQueryBuilder('log')
      .select(formatDate('log.createdAt', '%Y-%m-%d %H'), 'hour')
      .addSelect('COUNT(log.id)', 'count')
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();
  }

  /**
   * Get trend of total tokens used per hour
   */
  async getTokenUsageTrend(): Promise<{ hour: string; totalTokens: number }[]> {
    return this.logRepository
      .createQueryBuilder('log')
      .select(formatDate('log.createdAt', '%Y-%m-%d %H'), 'hour')
      .addSelect(
        'SUM(log.input_token_count + log.output_token_count)',
        'totalTokens',
      )
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();
  }

  /**
   * Record API call information for analysis
   */
  async recordCall(params: {
    inputTokenCount: number;
    outputTokenCount: number;
    providerId: string;
    model: string;
    responseTime: number;
    reason: 'completion' | 'embedding' | 'test';
  }): Promise<void> {
    const log = this.logRepository.create();
    log.input_token_count = params.inputTokenCount;
    log.output_token_count = params.outputTokenCount;
    log.providerId = params.providerId;
    log.model = params.model;
    await this.logRepository.save(log);
  }

  /**
   * Get trend of model usage per hour
   */
  /**
   * Get trend of average response time per hour
   * Note: Requires response_time field to be added to LogEntity and recorded during completions
   */
  async getResponseTimeTrend(): Promise<
    { hour: string; avgResponseTime: number }[]
  > {
    return this.logRepository
      .createQueryBuilder('log')
      .select(formatDate('log.createdAt', '%Y-%m-%d %H'), 'hour')
      .addSelect('AVG(log.response_time)', 'avgResponseTime')
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();
  }

  async getModelUsageTrend(): Promise<
    { hour: string; providerId: string; count: number }[]
  > {
    return this.logRepository
      .createQueryBuilder('log')
      .select(formatDate('log.createdAt', '%Y-%m-%d %H'), 'hour')
      .addSelect('log.providerId', 'providerId')
      .addSelect('log.model', 'model')
      .addSelect('COUNT(log.id)', 'count')
      .groupBy('hour, log.model')
      .orderBy('hour', 'ASC')
      .getRawMany();
  }
}
