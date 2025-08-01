import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/core/database/database.service';
import { HashService } from 'src/common/services/auth/hash.service';
import { emailExistsErr } from 'src/common/constants';
import { Prisma } from 'generated/prisma';

@Injectable()
export class UserService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly hashService: HashService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const exists = await this.databaseService.user.findFirst({
      where: {
        email: createUserDto.email,
      },
    });

    if (exists) {
      throw new ConflictException(emailExistsErr);
    }

    const { hash: password } = await this.hashService.generateAndHashPassword(
      createUserDto.password,
    );

    return this.databaseService.user.create({
      data: {
        ...createUserDto,
        password,
      },
    });
  }

  findAll(page?: number, perPage?: number, search?: string) {
    let actualPage = 0;
    const take = perPage || 10;

    if (page) if (page > 0) actualPage = page - 1;

    const skip = actualPage * take;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      if (isNaN(+search)) {
        where.email = search;
        where.name = {
          contains: search,
          mode: 'insensitive',
        };
      } else where.id = +search;
    }

    return this.databaseService.user.findMany({
      where,
      orderBy: {
        id: 'asc',
      },
      skip,
      take,
    });
  }

  async findOne(identifier: string) {
    const where: Prisma.UserWhereInput = {};

    if (isNaN(+identifier)) where.email = identifier;
    else where.id = +identifier;

    const user = await this.databaseService.user.findFirstOrThrow({
      where,
    });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.databaseService.user.findFirstOrThrow({
      where: { id },
      select: {
        id: true,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...data } = updateUserDto;
    // omit password for the update method

    return this.databaseService.user.update({
      where: {
        id: user.id,
      },
      data,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
