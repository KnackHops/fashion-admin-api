import { ConflictException, Injectable } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { DatabaseService } from 'src/core/database/database.service';
import { materialExistsErr } from 'src/common/constants';
import { Prisma } from 'generated/prisma';

@Injectable()
export class MaterialService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createMaterialDto: CreateMaterialDto) {
    const exist = await this.databaseService.material.findFirst({
      where: {
        name: {
          equals: createMaterialDto.name,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
      },
    });

    if (exist) {
      throw new ConflictException(materialExistsErr);
    }

    return await this.databaseService.material.create({
      data: createMaterialDto,
    });
  }

  findAll(page?: number, perPage?: number, search?: string) {
    let actualPage = 0;
    const take = perPage || 10;

    if (page) if (page > 0) actualPage = page - 1;

    const skip = actualPage * take;
    const where: Prisma.MaterialWhereInput = {};

    if (search) {
      if (isNaN(+search))
        where.name = {
          contains: search,
          mode: 'insensitive',
        };
      else where.id = +search;
    }

    return this.databaseService.material.findMany({
      where,
      skip,
      take,
    });
  }

  async findOne(id: number) {
    return await this.databaseService.material.findFirstOrThrow({
      where: { id },
    });
  }

  async update(id: number, updateMaterialDto: UpdateMaterialDto) {
    const existingMaterial =
      await this.databaseService.material.findFirstOrThrow({
        where: { id },
        select: {
          id: true,
        },
      });

    const conflictingMaterial = await this.databaseService.material.findFirst({
      where: {
        name: {
          equals: updateMaterialDto.name,
          mode: 'insensitive',
        },
        NOT: { id: existingMaterial.id },
      },
      select: { id: true },
    });

    if (conflictingMaterial) {
      throw new ConflictException(materialExistsErr);
    }

    return this.databaseService.material.update({
      where: { id },
      data: updateMaterialDto,
    });
  }

  remove(id: number) {
    return this.databaseService.material.delete({ where: { id } });
  }
}
