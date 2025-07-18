import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import {
  emailContainSpacesErr,
  passwordContainSpacesErr,
  passwordLengthErr,
  provideValidEmailErr,
} from 'src/common/constants';

export class LoginDto {
  @IsEmail(undefined, { message: provideValidEmailErr })
  @Matches(/^\S*$/, { message: emailContainSpacesErr })
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.toLowerCase();
  })
  email: string;

  @IsString()
  @MinLength(10, { message: passwordLengthErr })
  @Matches(/^\S*$/, { message: passwordContainSpacesErr })
  password: string;
}
