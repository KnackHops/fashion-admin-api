import { IsOptional, IsString } from 'class-validator';
import { Prisma } from 'generated/prisma';

export class CreateCategoryDto
  implements Pick<Prisma.CategoryCreateInput, 'name' | 'Item'>
{
  @IsString()
  name: string;

  @IsOptional()
  Item?: Prisma.ItemCreateNestedManyWithoutCategoryInput | undefined;
}
