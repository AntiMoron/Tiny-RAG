import { Body, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import checkParams from 'src/util/checkParams';
import express from 'express';
import * as _ from 'lodash';
import { COOKIE_NAME } from 'src/util/constant';
import { Redis } from 'ioredis';
import { Public } from 'src/util/public.decorator';

@Controller('api/user')
export class UserController {
  constructor(
    @Inject('REDIS_CLIENT') private redisClient: Redis,

    private readonly userService: UserService,
  ) {}

  @Get('profile')
  async getUserInfo(@Req() req: express.Request, @Res() res: express.Response) {
    const cookie = req.cookies?.[COOKIE_NAME];
    // get user info from cookie
    const user = await this.userService.getUserFromToken(cookie);
    const { accessToken } = this.userService.refreshAccessToken(cookie);
    const redisTokenKey = `token:${user.id}:${user.username}`;
    await this.redisClient.set(redisTokenKey, accessToken, 'EX', 3600);
    res.cookie(COOKIE_NAME, accessToken, {
      maxAge: 3600 * 1000,
      httpOnly: true,
    });
    return res.json(_.pick(user, ['id', 'username', 'createdAt']));
  }

  @Public()
  @Post('login')
  async login(@Body() body, @Res() res: express.Response) {
    checkParams(body, ['encrypedPwd', 'username']);
    const user = await this.userService.login(
      body as { encrypedPwd: string; username: string },
    );
    const jwt = this.userService.generateTokens(user);
    res.cookie(COOKIE_NAME, jwt.accessToken, {
      maxAge: 3600 * 1000,
      httpOnly: true,
    });
    const redisTokenKey = `token:${user.id}:${user.username}`;
    await this.redisClient.set(redisTokenKey, jwt.accessToken, 'EX', 3600);

    return res.json({
      code: 0,
      data: {
        ..._.omit(user, ['encrypt_pwd']),
        ...jwt,
      },
    });
  }
}
