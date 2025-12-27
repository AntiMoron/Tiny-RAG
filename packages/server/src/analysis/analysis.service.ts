import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogEntity } from './analysis.entity';

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
      .select("DATE_FORMAT(log.createdAt, '%Y-%m-%d %H:00:00')", 'hour')
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
      .select("DATE_FORMAT(log.createdAt, '%Y-%m-%d %H:00:00')", 'hour')
      .addSelect(
        'SUM(log.input_token_count + log.output_token_count)',
        'totalTokens',
      )
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();
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
      .select("DATE_FORMAT(log.createdAt, '%Y-%m-%d %H:00:00')", 'hour')
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
      .select("DATE_FORMAT(log.createdAt, '%Y-%m-%d %H:00:00')", 'hour')
      .addSelect('log.providerId', 'providerId')
      .addSelect('COUNT(log.id)', 'count')
      .groupBy('hour, log.providerId')
      .orderBy('hour', 'ASC')
      .getRawMany();
  }
}
