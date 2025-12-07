import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApikeyService } from './apikey.service';
import checkParams from 'src/util/checkParams';

@Controller('api/apikey')
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

  @Post('add')
  async createApiKey(@Body() body: { name: string; description: string }) {
    checkParams(body, ['name']);
    return await this.apikeyService.createApiKey(body.name, body.description);
  }
}
