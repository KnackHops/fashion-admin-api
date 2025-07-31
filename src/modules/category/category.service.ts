import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DatabaseService } from 'src/core/database/database.service';
import { categoryExistsErr } from 'src/common/constants';

@Injectable()
export class CategoryService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const exist = await this.databaseService.category.findFirst({
      where: {
        name: {
          contains: createCategoryDto.name,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    if (exist) {
      throw new ConflictException(categoryExistsErr);
    }

    return this.databaseService.category.create({ data: createCategoryDto });
  }

  findAll(page?: number, perPage?: number, search?: string) {
    let actualPage = 0;
    const take = perPage || 10;

    if (page) if (page > 0) actualPage = page - 1;

    const skip = actualPage * take;

    const idSearch = search
      ? isNaN(+search)
        ? undefined
        : +search
      : undefined;

    return this.databaseService.category.findMany({
      ...(search || idSearch
        ? {
            where: {
              OR: [
                {
                  id: idSearch,
                },
                {
                  name: {
                    search: search,
                  },
                },
              ],
            },
          }
        : {}),
      orderBy: {
        id: 'asc',
      },
      skip,
      take,
    });
  }

  async findOne(identifier: string) {
    let id: number | undefined = undefined;
    let name: string | undefined = undefined;

    if (isNaN(+identifier)) name = identifier;
    else id = +identifier;

    const category = await this.databaseService.category.findFirstOrThrow({
      where: {
        OR: [{ name, id }],
      },
    });

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const existingCategory =
      await this.databaseService.category.findFirstOrThrow({
        where: { id },
        select: {
          id: true,
        },
      });

    const category = await this.databaseService.category.findFirst({
      where: {
        name: {
          contains: updateCategoryDto.name,
          mode: 'insensitive',
        },
        NOT: {
          id: existingCategory.id,
        },
      },
    });

    if (category) {
      throw new ConflictException(categoryExistsErr);
    }

    return await this.databaseService.category.update({
      data: updateCategoryDto,
      where: {
        id,
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
