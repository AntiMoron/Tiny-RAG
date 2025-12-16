import { Module, Global } from '@nestjs/common';
import * as LRUCache from 'lru-cache';
import getEnvConfigValue from 'src/util/getEnvConfigValue';

@Global()
@Module({
  providers: [
    {
      provide: 'LRU_CACHE',
      useFactory: () => {
        return new LRUCache.LRUCache({
          max: parseInt(getEnvConfigValue('LRU_CACHE_MAX'), 10) || 5000,
          ttl: parseInt(getEnvConfigValue('LRU_CACHE_TTL_MS'), 10) || 60000,
        });
      },
    },
  ],
  exports: ['LRU_CACHE'],
})
export class LruCacheModule {}
