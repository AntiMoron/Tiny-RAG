import { forwardRef, Module } from '@nestjs/common';
import { FeishuService } from './feishu.service';
import { FeishuController } from './feishu.controller';
import { DatasetModule } from 'src/dataset/dataset.module';

@Module({
  providers: [FeishuService],
  controllers: [FeishuController],
  imports: [forwardRef(() => DatasetModule)],
  exports: [FeishuService],
})
export class FeishuModule {}
