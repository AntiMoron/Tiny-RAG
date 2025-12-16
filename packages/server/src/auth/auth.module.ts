import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import getEnvConfigValue from 'src/util/getEnvConfigValue';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () =>
        ({
          secret: getEnvConfigValue('JWT_SECRET'),
          signOptions: {
            secret: getEnvConfigValue('JWT_SECRET'),
            expiresIn:
              getEnvConfigValue('JWT_ACCESS_TOKEN_EXPIRES_IN') || '15m',
          },
        }) as unknown as any,
    }),
    UserModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
