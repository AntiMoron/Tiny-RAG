import { Test, TestingModule } from '@nestjs/testing';
import { AiproviderController } from './aiprovider.controller';

describe('AiproviderController', () => {
  let controller: AiproviderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiproviderController],
    }).compile();

    controller = module.get<AiproviderController>(AiproviderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
