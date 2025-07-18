import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { IAccessTokenPayload } from 'src/common/types';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_SECRET } from 'src/common/constants/envNames';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get(JWT_SECRET) as string,
    });
  }

  validate(payload: IAccessTokenPayload) {
    const { sub: userId, email } = payload;
    return { userId, email };
  }
}
