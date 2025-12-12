import { Test, TestingModule } from '@nestjs/testing';
import { RetrieveController } from './retrieve.controller';

describe('RetrieveController', () => {
  let controller: RetrieveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RetrieveController],
    }).compile();

    controller = module.get<RetrieveController>(RetrieveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
