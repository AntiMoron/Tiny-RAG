import { Controller, Get } from '@nestjs/common';
import { CompletionService } from './completion.service';

@Controller('completion')
export class CompletionController {
  constructor(private readonly completionService: CompletionService) {}

  @Get('test')
  async test() {
    return await this.completionService.completeById('123', 'hello world');
  }
}
