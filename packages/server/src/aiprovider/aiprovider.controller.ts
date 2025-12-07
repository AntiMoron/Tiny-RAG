import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
} from '@nestjs/common';
import { AiproviderService } from './aiprovider.service';
import { AIProvider } from 'tinyrag-types/aiprovider';
import checkParams from 'src/util/checkParams';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import * as _ from 'lodash';

@Controller('api/aiprovider')
export class AiproviderController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: WinstonLogger,
    private readonly aiProviderService: AiproviderService,
  ) {}

  @Get('list')
  async listAllAIProviders() {
    return await this.aiProviderService.findAll();
  }

  @Delete('delete/:id')
  async removeById(@Param('id') id: string) {
    const thatOne = await this.aiProviderService.findOne(id);
    if (!thatOne) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return await this.aiProviderService.remove(id);
  }

  @Post('add')
  async addAIProvider(@Body() dto: Omit<AIProvider, 'id'>) {
    checkParams(dto, ['name', 'type', 'config']);
    const config = dto?.config;
    if (_.isEmpty(config)) {
      throw new HttpException('Config cannot be empty', HttpStatus.BAD_REQUEST);
    }
    const { name } = dto;
    const conflict = await this.aiProviderService.findOneByName(name);
    if (conflict) {
      throw new HttpException(
        'AI Provider with the same name already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.aiProviderService.create(dto);
  }

  @Post('update')
  async updateAIProvider(@Body() d: any) {
    const dto = d as AIProvider;
    checkParams(dto, ['id', 'name', 'type', 'config']);
    const id = dto.id;
    const config = dto?.config;
    if (_.isEmpty(config)) {
      throw new HttpException('Config cannot be empty', HttpStatus.BAD_REQUEST);
    }
    const thatOne = await this.aiProviderService.findOne(id);
    if (!thatOne) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    const { name } = dto;
    const conflict = await this.aiProviderService.findOneByName(name);
    if (conflict && conflict.id !== id) {
      throw new HttpException(
        'AI Provider with the same name already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.aiProviderService.update(id, dto);
  }

  @Get('test/:id')
  async testAIProvider(@Param('id') id: string) {
    try {
      await this.aiProviderService.testAIProvider(id);
    } catch (err) {
      await this.aiProviderService.setTestStatus(id, 'error');
      throw new HttpException(
        'Test failed: ' + err.message,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.aiProviderService.setTestStatus(id, 'ok');
    return 'OK';
  }
}
