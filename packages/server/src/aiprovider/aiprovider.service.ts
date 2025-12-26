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
import { AICompletionResponse } from 'tinyrag-types/completion';
import { AIEmbeddingResponse } from 'tinyrag-types/embedding';
import completionDefaults from 'src/default_config/completion';
import embeddingDefaults from 'src/default_config/embedding';

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
    const config = result?.config ? JSON.parse(result.config) : null;
    if (result && config) {
      (result as any).config = config;
    }
    return result
      ? (result as Omit<AIProviderEntity, 'config'> & {
          config: any;
        } as AIProvider)
      : null;
  }

  async findOne(id: string): Promise<AIProvider | null> {
    const result = await this.repo.findOneBy({ id });
    const config = result?.config ? JSON.parse(result.config) : null;
    if (result && config) {
      (result as any).config = config;
    }
    return result
      ? (result as Omit<AIProviderEntity, 'config'> & {
          config: any;
        } as AIProvider)
      : null;
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
    if (patch.config !== undefined) {
      ent.config = patch.config ? JSON.stringify(patch.config) : '';
    }
    if (patch.type !== undefined) ent.type = patch.type;
    return this.repo.save(ent);
  }

  async remove(id: string): Promise<boolean> {
    const res = await this.repo.delete({ id });
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
    let ret: AICompletionResponse | AIEmbeddingResponse | undefined;
    switch (type) {
      case 'completion':
        ret = await this.completionService.completeById(id, 'Hello world!');
        isWorking = Boolean(
          ret &&
          ret.data &&
          typeof ret?.data?.result === 'string' &&
          ret?.usage?.completion_tokens > 0,
        );
        break;
      case 'embedding':
        ret = await this.embeddingService.embedById(id, 'test');
        isWorking = Boolean(
          ret &&
          ret.data &&
          Array.isArray(ret?.data?.result) &&
          ret.data.result.length > 0 &&
          ret?.usage?.total_tokens > 0,
        );
        break;
      default:
        break;
    }
    if (!isWorking) {
      throw new HttpException(
        'AI Provider test failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async setTestStatus(id: string, status: null | 'ok' | 'error') {
    const provider = await this.repo.findOneBy({ id });
    if (!provider) {
      throw new HttpException('AI Provider not found', HttpStatus.NOT_FOUND);
    }
    provider.lastTestStatus = status as string;
    return await this.repo.save(provider);
  }

  listDefaultProviderConfigs(
    type: AIProvider['type'],
    providerBrand: string,
  ): Omit<AIProvider, 'id' | 'name'> {
    let defaults: Record<string, Omit<AIProvider, 'id' | 'name'>> | undefined;
    switch (type) {
      case 'completion':
        defaults = completionDefaults;
        break;
      case 'embedding':
        defaults = embeddingDefaults;
        break;
      default:
        throw new HttpException(
          'Unsupported AI provider type',
          HttpStatus.BAD_REQUEST,
        );
    }
    const config = defaults[providerBrand];
    if (!config) {
      throw new HttpException(
        'No default config found for the specified provider brand',
        HttpStatus.NOT_FOUND,
      );
    }
    return config;
  }
}
