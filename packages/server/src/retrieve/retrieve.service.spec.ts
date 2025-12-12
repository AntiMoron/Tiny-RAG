import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveService } from './retrieve.service';

describe('RetriveService', () => {
  let service: RetrieveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetrieveService],
    }).compile();

    service = module.get<RetrieveService>(RetrieveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
