import { Module } from '@nestjs/common';
import { ApikeyService } from './apikey.service';
import { ApikeyController } from './apikey.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyEntity } from './apiKey.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKeyEntity])],
  providers: [ApikeyService],
  controllers: [ApikeyController],
  exports: [ApikeyService],
})
export class ApikeyModule {}
