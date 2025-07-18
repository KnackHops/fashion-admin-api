import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { $Enums, Prisma } from 'generated/prisma';
import {
  passwordContainSpacesErr,
  passwordLengthErr,
} from 'src/common/constants';

export class CreateUserDto
  implements
    Pick<
      Prisma.UserCreateInput,
      'name' | 'email' | 'password' | 'age' | 'gender'
    >
{
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.trim();
  })
  name: string;
  email: string;

  @IsString()
  @MinLength(10, { message: passwordLengthErr })
  @Matches(/^\S*$/, { message: passwordContainSpacesErr })
  @IsOptional()
  password: string;

  @IsInt()
  age: number;

  @IsEnum($Enums.EGender, { message: 'Invalid Gender' })
  gender: $Enums.EGender;
}
