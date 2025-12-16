import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import getEnvConfigValue from 'src/util/getEnvConfigValue';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const redisUrl = getEnvConfigValue('REDIS_URL');
        const redisPassword = getEnvConfigValue('REDIS_PASSWORD');
        const redisDb = getEnvConfigValue('REDIS_DB');
        const [protocol, host, port] = redisUrl.split(':');
        return new Redis({
          host: `${host.replace('//', '')}`,
          port: Number(port),
          password: redisPassword,
          db: Number(redisDb) || 0,
          retryStrategy: (times) => {
            const delay = Math.min(times * 100, 3000);
            return delay;
          },
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
