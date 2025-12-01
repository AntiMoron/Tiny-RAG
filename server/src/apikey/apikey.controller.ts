import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApikeyService } from './apikey.service';

@Controller('apikey')
export class ApikeyController {
  constructor(private readonly apikeyService: ApikeyService) {}

  @Get('list')
  async listApiKeys() {
    return await this.apikeyService.listApiKeys();
  }

  @Delete('delete/:id')
  async deleteApiKey(@Param('id') id: string) {
    await this.apikeyService.deleteApiKey(id);
    return { OK: true };
  }

  @Post('create')
  async createApiKey() {
    // Implementation for creating an API key goes here
  }
}
