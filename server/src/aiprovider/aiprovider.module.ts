import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiproviderService } from './aiprovider.service';
import { AiproviderController } from './aiprovider.controller';
import { AIProviderEntity } from './aiprovider.entity';

/**
 * To start implementing the system, I choose to start from here.
 * At lease I need to have some AI abilities.
 * I used Doubao as my testing AI provider.
 *
 * 1. Save providers for further usage. [P0]
 * 2. List all providers. [P0]
 * 3. Update provider config. [P0]
 * 4. Delete provider. [P1]
 * 5. Use provider to do embedding / completion / vision tasks. [P0]
 */
@Module({
  imports: [TypeOrmModule.forFeature([AIProviderEntity])],
  providers: [AiproviderService],
  controllers: [AiproviderController],
  exports: [AiproviderService, ],
})
export class AiproviderModule {}
