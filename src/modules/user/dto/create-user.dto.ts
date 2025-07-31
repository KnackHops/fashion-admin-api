import { Transform } from 'class-transformer';
import {
  IsEmail,
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
  provideValidEmailErr,
} from 'src/common/constants';

export class CreateUserDto
  implements
    Pick<
      Prisma.UserCreateInput,
      | 'name'
      | 'email'
      | 'password'
      | 'age'
      | 'gender'
      | 'profileImage'
      | 'FavoriteItem'
      | 'FavoriteOutfit'
      | 'height'
      | 'chest'
      | 'shoulder'
      | 'torsoLength'
      | 'waist'
    >
{
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.trim();
  })
  name: string;

  @IsEmail({}, { message: provideValidEmailErr })
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.toLowerCase().trim();
  })
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

  @IsOptional()
  profileImage?: string | null | undefined;

  FavoriteItem?:
    | Prisma.FavoriteItemCreateNestedManyWithoutUserInput
    | undefined;

  FavoriteOutfit?:
    | Prisma.FavoriteOutfitCreateNestedManyWithoutUserInput
    | undefined;

  @IsInt()
  @IsOptional()
  height?: number | null | undefined;

  @IsInt()
  @IsOptional()
  chest?: number | null | undefined;

  @IsInt()
  @IsOptional()
  shoulder?: number | null | undefined;

  @IsInt()
  @IsOptional()
  torsoLength?: number | null | undefined;

  @IsInt()
  @IsOptional()
  waist?: number | null | undefined;
}
