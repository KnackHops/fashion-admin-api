import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Prisma } from '../../../../generated/prisma';
import { Transform } from 'class-transformer';
import {
  passwordContainSpacesErr,
  passwordLengthErr,
  provideValidEmailErr,
} from 'src/common/constants/errorMessages';

export class CreateAdminDto
  implements Pick<Prisma.AdminCreateInput, 'email' | 'name' | 'password'>
{
  @IsEmail({}, { message: provideValidEmailErr })
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.toLowerCase().trim();
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.trim();
  })
  name: string;

  @IsString()
  @MinLength(10, { message: passwordLengthErr })
  @Matches(/^\S*$/, { message: passwordContainSpacesErr })
  @IsOptional()
  password: string;
}
