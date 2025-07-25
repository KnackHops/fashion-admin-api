import { IsString, Matches, MinLength } from 'class-validator';
import {
  passwordContainSpacesErr,
  passwordLengthErr,
} from 'src/common/constants';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(10, { message: passwordLengthErr })
  @Matches(/^\S*$/, { message: passwordContainSpacesErr })
  password: string;

  @IsString()
  @MinLength(10, { message: passwordLengthErr })
  @Matches(/^\S*$/, { message: passwordContainSpacesErr })
  previousPassword: string;
}
