import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { DatabaseService } from 'src/core/database/database.service';
import { UserService } from '../user/user.service';
// import { CreateItemDto } from './dto/create-item.dto';
// import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly userService: UserService,
  ) {}
  // create(createItemDto: CreateItemDto) {
  //   return 'This action adds a new item';
  // }

  findAll(page?: number, perPage?: number, search?: string) {
    let actualPage = 0;
    const take = perPage || 10;

    if (page) if (page > 0) actualPage = page - 1;

    const skip = actualPage * take;

    const where: Prisma.ItemWhereInput = {};

    if (search) {
      if (isNaN(+search)) {
        where.id = +search;
      } else
        where.name = {
          equals: search,
          mode: 'insensitive',
        };
    }

    return this.databaseService.item.findMany({
      where,
      take,
      skip,
    });
  }

  async findByUser(userId: number) {
    const user = await this.userService.findOne(`${userId}`);

    console.log(user);

    return [];
  }

  findOne(identifier: string) {
    const where: Prisma.ItemWhereInput = {};

    if (isNaN(+identifier)) where.name = identifier;
    else where.id = +identifier;

    return this.databaseService.item.findFirstOrThrow({ where });
  }

  // update(id: number, updateItemDto: UpdateItemDto) {
  //   return `This action updates a #${id} item`;
  // }

  remove(id: number) {
    return `This action removes a #${id} item`;
  }
}
