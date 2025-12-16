// src/auth/guards/jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/util/public.decorator';
import { IS_API_KEY } from 'src/util/api.decorator';
import { ApikeyService } from 'src/apikey/apikey.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // 路径白名单（可选）
  private readonly whiteListPaths = ['/favicon.ico', '/health'];

  constructor(
    private readonly reflector: Reflector,
    private readonly apiKeyService: ApikeyService,
  ) {
    super();
  }

  // 【关键】Nest守卫的canActivate方法：天然能获取ExecutionContext
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    if (this.isPathInWhiteList(req.path)) return true;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requireApiKey = this.reflector.getAllAndOverride<boolean>(
      IS_API_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic && requireApiKey) {
      const reqApiKey = req.headers['x-api-key'] as string;
      try {
        const keyEntity = await this.apiKeyService.validateKey(reqApiKey);
        return Boolean(keyEntity);
      } catch (error) {
        throw new UnauthorizedException(`API Key error：${error.message}`);
      }
    }

    if (isPublic && !requireApiKey) return true;

    return super.canActivate(context) as Promise<boolean>;
  }

  private isPathInWhiteList(path: string): boolean {
    return this.whiteListPaths.some(
      (whitePath) =>
        whitePath === path ||
        (whitePath.endsWith('*') && path.startsWith(whitePath.slice(0, -1))),
    );
  }
}
