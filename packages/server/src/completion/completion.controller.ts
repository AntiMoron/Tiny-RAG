import { Controller, Get, Param } from '@nestjs/common';
import { CompletionService } from './completion.service';
import { Public } from 'src/util/public.decorator';
import { TinyRAGAPI } from 'src/util/api.decorator';

@Controller('api/completion')
export class CompletionController {
  constructor(private readonly completionService: CompletionService) {}

  @Public()
  @TinyRAGAPI()
  @Get('provider/:providerId/export')
  async doCompletion(@Param('providerId') providerId: string) {
    return this.completionService.completeById(providerId, 'Hello, world!');
  }
}
