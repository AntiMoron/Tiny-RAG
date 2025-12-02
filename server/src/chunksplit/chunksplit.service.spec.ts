import { Test, TestingModule } from '@nestjs/testing';
import { ChunksplitService } from './chunksplit.service';

describe('ChunksplitService', () => {
  let service: ChunksplitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChunksplitService],
    }).compile();

    service = module.get<ChunksplitService>(ChunksplitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
