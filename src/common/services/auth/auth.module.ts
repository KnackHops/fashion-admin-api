import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from 'src/modules/admin/admin.module';
import { HashService } from './hash.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWT_SECRET } from 'src/common/constants/envNames';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    forwardRef(() => AdminModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(JWT_SECRET),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, HashService, LocalStrategy, JwtStrategy],
  exports: [AuthService, HashService],
  controllers: [AuthController],
})
export class AuthModule {}
