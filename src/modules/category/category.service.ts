import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DatabaseService } from 'src/core/database/database.service';
import { categoryExistsErr, categoryNotFoundErr } from 'src/common/constants';

@Injectable()
export class CategoryService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const name = createCategoryDto.name.toLowerCase();

    const exist = await this.findOne(name).catch(() => null);

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

    const category = await this.databaseService.category.findFirst({
      where: { id, name },
    });

    if (!category) {
      throw new NotFoundException(categoryNotFoundErr);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const exist = await this.findOne(`${id}`);

    if (!exist) {
      throw new NotFoundException(categoryNotFoundErr);
    }

    const categories = await this.databaseService.category.findMany({
      where: {
        name: {
          search: updateCategoryDto.name,
        },
        NOT: {
          id,
        },
      },
    });

    if (categories.length > 0) {
      throw new ConflictException(categoryExistsErr);
    }

    return this.databaseService.category
      .update({
        data: updateCategoryDto,
        where: {
          id,
        },
      })
      .then(() => this.findOne(`${id}`));
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
