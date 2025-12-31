import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import sha256 from 'src/util/sha256';
import { JwtService } from '@nestjs/jwt';
import getEnvConfigValue from 'src/util/getEnvConfigValue';

@Injectable()
export class UserService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    const cnt = await this.getUserCount();
    if (0 === cnt) {
      const defaultName = getEnvConfigValue('ADMIN_NAME');
      const defaultRootPwd = getEnvConfigValue('ADMIN_PASSWORD');
      const pwdHash = sha256(defaultRootPwd);
      await this.insertUser({
        username: defaultName,
        encrypt_pwd: pwdHash,
      });
    }
  }

  async getUserByName(name: string) {
    const user = await this.repo.findOneBy({ username: name });
    return user;
  }

  async getUserById(id: string) {
    const user = await this.repo.findOneBy({ id });
    return user;
  }

  async getUserCount() {
    const data = await this.repo.count();
    return data;
  }

  async insertUser(user: Omit<UserEntity, 'id' | 'createdAt'>) {
    const u = this.repo.create({
      ...user,
    });
    return await this.repo.save(u);
  }

  async login(user: { encrypedPwd: string; username: string }) {
    const { encrypedPwd, username } = user;
    const u = await this.getUserByName(username);
    if (!u) {
      throw new HttpException('User does not exist', HttpStatus.UNAUTHORIZED);
    }
    if (u.encrypt_pwd !== encrypedPwd) {
      throw new HttpException('Incorrect password', HttpStatus.UNAUTHORIZED);
    }
    return u;
  }

  generateTokens(user: Omit<UserEntity, 'encrypt_pwd'>) {
    // 1. 定义 Token Payload（避免存储敏感信息）
    const payload = {
      sub: user.id, // JWT 标准字段：用户唯一标识
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload as unknown as any, {
      expiresIn: (getEnvConfigValue('JWT_ACCESS_TOKEN_EXPIRES_IN') ||
        '1h') as any,
      secret: getEnvConfigValue('JWT_SECRET'),
    });

    // 3. 生成刷新令牌（长期有效，用于刷新访问令牌）
    const refreshToken = this.jwtService.sign(payload as unknown as any, {
      expiresIn: (getEnvConfigValue('JWT_REFRESH_TOKEN_EXPIRES_IN') ||
        '1h') as any,
      secret: getEnvConfigValue('JWT_SECRET'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * 验证刷新令牌并生成新的访问令牌
   */
  refreshAccessToken(refreshToken: string) {
    try {
      // 验证刷新令牌有效性
      const payload = this.jwtService.verify(refreshToken, {
        // secret: getEnvConfigValue('JWT_SECRET'),
      }) as unknown as {
        sub: string;
        username: string;
      };

      // 生成新的访问令牌
      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub, username: payload.username },
        {
          expiresIn: (getEnvConfigValue('JWT_ACCESS_TOKEN_EXPIRES_IN') ||
            '1h') as any,
          secret: getEnvConfigValue('JWT_SECRET'),
        },
      );
      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getUserFromToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        // secret: getEnvConfigValue('JWT_SECRET'),
      }) as unknown as {
        sub: string;
        username: string;
      };
      const user = await this.getUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
