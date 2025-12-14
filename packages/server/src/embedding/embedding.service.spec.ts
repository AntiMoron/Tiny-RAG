import { EmbeddingService } from './embedding.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('EmbeddingService', () => {
  let service: EmbeddingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmbeddingService],
    }).compile();

    service = module.get<EmbeddingService>(EmbeddingService);
  });

  it('removes English stopwords and lowercases', async () => {
    const res = await service.removeStopWords(
      'This is a test of the stop word removal.',
    );
    expect(res).toContain('test');
    expect(res.toLowerCase()).not.toMatch(/\bthis\b/);
    expect(res.toLowerCase()).not.toMatch(/\bis\b/);
  });

  it('handles Chinese and removes punctuation', async () => {
    const res = await service.removeStopWords('这是一个测试。停用词应该被移除。');
    expect(res).toContain('测试');
    expect(res).not.toMatch(/[。！？,.]/);
  });

  it('handles mixed text and dedupes tokens', async () => {
    const res = await service.removeStopWords(
      'Hello, 世界！This is tiny. test test the the',
    );
    expect(res).toContain('hello');
    expect(res).toContain('世界');
    const parts = res.split(/\s+/).filter(Boolean);
    expect(parts.filter((p) => p === 'test').length).toBe(1);
  });

  it('returns empty string for empty input', async () => {
    const res = await service.removeStopWords('');
    expect(res).toBe('');
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
