import { Test, TestingModule } from '@nestjs/testing';
import { AiproviderService } from './aiprovider.service';

describe('AiproviderService', () => {
  let service: AiproviderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiproviderService],
    }).compile();

    service = module.get<AiproviderService>(AiproviderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
