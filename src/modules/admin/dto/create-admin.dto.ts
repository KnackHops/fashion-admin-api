import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Prisma } from '../../../../generated/prisma';
import { Transform } from 'class-transformer';
import {
  emailContainSpacesErr,
  passwordContainSpacesErr,
  passwordLengthErr,
  provideValidEmailErr,
} from 'src/common/errorMessages';

export class CreateAdminDto
  implements Pick<Prisma.AdminCreateInput, 'email' | 'name' | 'password'>
{
  @IsEmail(undefined, { message: provideValidEmailErr })
  @Matches(/^\S*$/, { message: emailContainSpacesErr })
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.toLowerCase();
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
  password: string;
}
