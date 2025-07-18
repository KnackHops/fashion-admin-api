import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Admin } from 'generated/prisma';
import { ILoginResponse } from 'src/common/types';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateAdminDto } from 'src/modules/admin/dto/create-admin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: { user: Admin }) {
    const { access_token } = this.authService.login(req.user);

    return {
      access_token,
      user: req.user,
    } as ILoginResponse;
  }

  @Public()
  @Post('register')
  register(@Body(ValidationPipe) createAdminDto: CreateAdminDto) {
    return this.authService.register(createAdminDto);
  }
}
