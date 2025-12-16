import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { UserService } from 'src/user/user.service';
import * as LRU from 'lru-cache';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private configService: ConfigService,
    @Inject('LRU_CACHE') private lruCache: LRU.LRUCache<string, string>,
    @Inject('REDIS_CLIENT') private redisClient: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('app.jwt.secret')!,
    });
  }

  async validate(payload: { sub: string; username: string }) {
    const { sub: userId, username } = payload;

    // 1. 优先从 LRU 缓存获取用户 token 状态
    const lruTokenKey = `token:${userId}:${username}`;
    const lruTokenStatus = this.lruCache.get(lruTokenKey);
    if (!lruTokenStatus) {
      // 2. LRU 缓存未命中，从 Redis 获取
      const redisTokenKey = `token:${userId}:${username}`;
      const redisTokenStatus = await this.redisClient.get(redisTokenKey);
      if (!redisTokenStatus) {
        throw new UnauthorizedException('Token 已过期或无效');
      }
      // 同步到 LRU 缓存
      this.lruCache.set(lruTokenKey, redisTokenStatus);
    }

    // 3. 验证用户是否存在
    const user = await this.userService.getUserByName(username);

    if (!user) {
      throw new UnauthorizedException('User not exist');
    }

    // 4. 返回用户信息（会挂载到 req.user）
    return { id: user.id, username: user.username };
  }
}
