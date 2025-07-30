import { IsString } from 'class-validator';
import { Material } from 'generated/prisma';

export class CreateMaterialDto implements Pick<Material, 'name'> {
  @IsString()
  name: string;
}
