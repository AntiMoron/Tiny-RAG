import { Controller, Get } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';

@Controller('embedding')
export class EmbeddingController {
  constructor(private readonly embeddingService: EmbeddingService) {}

  @Get('test')
  async testEndpoint() {
    return await this.embeddingService.embedById('1', 'hello');
  }
}
