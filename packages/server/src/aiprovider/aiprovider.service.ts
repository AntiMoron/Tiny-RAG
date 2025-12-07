import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIProviderEntity } from './aiprovider.entity';
import { AIProvider } from 'tinyrag-types/aiprovider';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { CompletionService } from 'src/completion/completion.service';

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
    @Inject(forwardRef(() => EmbeddingService))
    private readonly embeddingService: EmbeddingService,
    @Inject(forwardRef(() => CompletionService))
    private readonly completionService: CompletionService,
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

  async findOneByName(name: string): Promise<AIProvider | null> {
    const result = await this.repo.findOneBy({ name });
    return result ? (result as AIProvider) : null;
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

  async testAIProvider(id: string) {
    const provider = await this.findOne(id);
    if (!provider) {
      throw new HttpException('AI Provider not found', HttpStatus.NOT_FOUND);
    }
    const { type } = provider;
    let isWorking = false;
    switch (type) {
      case 'completion':
        const compRet = await this.completionService.completeById(
          id,
          'Hello world!',
        );
        isWorking = Boolean(
          compRet &&
          compRet.data &&
          typeof compRet?.data?.result === 'string' &&
          compRet?.usage?.completion_tokens > 0,
        );
        break;
      case 'embedding':
        const embRet = await this.embeddingService.embedById(id, 'test');
        isWorking = Boolean(
          embRet &&
          embRet.data &&
          Array.isArray(embRet?.data?.result) &&
          embRet.data.result.length > 0 &&
          embRet?.usage?.completion_tokens > 0,
        );
        break;
      default:
        break;
    }
  }

  async setTestStatus(id: string, status:  'ok' | 'error') {
    const provider = await this.repo.findOneBy({ id });
    if (!provider) {
      throw new HttpException('AI Provider not found', HttpStatus.NOT_FOUND);
    }
    provider.lastTestStatus = status;
    return await this.repo.save(provider);
  }
}
