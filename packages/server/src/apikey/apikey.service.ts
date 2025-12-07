import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiKeyEntity } from './apiKey.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ApikeyService {
  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly repo: Repository<ApiKeyEntity>,
  ) {}

  async deleteApiKey(id: string) {
    await this.repo.delete({ id });
  }

  async listApiKeys() {
    return await this.repo.find();
  }

  async createApiKey(name: string, description: string): Promise<ApiKeyEntity> {
    const apiKey = this.repo.create();
    apiKey.name = name;
    apiKey.description = description;
    apiKey.key = 'tinyrag_' + crypto.randomUUID().replace(/-/g, '');
    return await this.repo.save(apiKey);
  }
}
