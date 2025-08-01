import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { Prisma } from 'generated/prisma';

export class CreateMaterialDto
  implements Pick<Prisma.MaterialCreateInput, 'name'>
{
  @IsString()
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.trim();
  })
  name: string;
}
