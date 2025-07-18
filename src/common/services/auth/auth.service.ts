import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { passwordNotMatchErr, userNotFoundErr } from 'src/common/constants';
import { AdminService } from 'src/modules/admin/admin.service';
import { HashService } from './hash.service';
import { Admin } from 'generated/prisma';
import { IAccessTokenPayload, IAccessToken } from 'src/common/types';
import { CreateAdminDto } from 'src/modules/admin/dto/create-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.adminService.findOne(email);

    if (!user) {
      throw new NotFoundException(userNotFoundErr);
    }

    const isMatch = await this.hashService.comparePassword(
      password,
      user.password,
    );

    if (!isMatch) {
      throw new UnauthorizedException(passwordNotMatchErr);
    }

    return user;
  }

  login(user: Admin) {
    const payload: IAccessTokenPayload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    return { access_token } as IAccessToken;
  }

  async register(createAdminDto: CreateAdminDto) {
    const user = await this.adminService.create(createAdminDto);

    return this.login(user);
  }
}
