import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIProviderEntity } from './aiprovider.entity';
import { AIProvider } from '../types/aiprovider';

/**
 * 1. Save providers for further usage. [P0]
 * 2. List all providers. [P0]
 * 3. Update provider config. [P0]
 * 4. Delete provider. [P1]
 * 5. Use provider to do embedding / completion / vision tasks. [P0]
 */
@Injectable()
export class AiproviderService {
  constructor(
    @InjectRepository(AIProviderEntity)
    private readonly repo: Repository<AIProviderEntity>,
  ) {}

  async create(
    payload: Partial<Omit<AIProvider, 'id'>>,
  ): Promise<AIProviderEntity[]> {
    const ent = this.repo.create({
      name: payload.name,
      config: payload.config,
    } as any);
    return this.repo.save(ent);
  }

  async findAll(): Promise<AIProviderEntity[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<AIProvider | null> {
    const result = await this.repo.findOneBy({ id });
    return result ? (result as AIProvider) : null;
  }

  async findProvidersByType(
    type: AIProvider['type'],
  ): Promise<AIProviderEntity[]> {
    return this.repo
      .createQueryBuilder('provider')
      .where({
        type,
      })
      .getMany();
  }

  async update(
    id: string,
    patch: Partial<Omit<AIProvider, 'id'>>,
  ): Promise<AIProviderEntity | null> {
    const ent = await this.repo.findOneBy({ id });
    if (!ent) return null;
    if (patch.name !== undefined) ent.name = patch.name;
    if (patch.config !== undefined) ent.config = patch.config as any;
    return this.repo.save(ent);
  }

  async remove(id: string): Promise<boolean> {
    const res = await this.repo.delete({ id } as any);
    if (!res) {
      throw new Error('Delete operation failed');
    }
    return (res.affected as number) > 0;
  }
}
