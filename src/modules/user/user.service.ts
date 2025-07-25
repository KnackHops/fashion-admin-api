import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/core/database/database.service';
import { HashService } from 'src/common/services/auth/hash.service';
import { User } from 'generated/prisma';
import { emailExistsErr, userNotFoundErr } from 'src/common/constants';

@Injectable()
export class UserService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly hashService: HashService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const exists = await this.findOne(createUserDto.email).catch(() => null);

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

    const idSearch = search
      ? isNaN(+search)
        ? undefined
        : +search
      : undefined;

    return this.databaseService.user.findMany({
      ...(search || idSearch
        ? {
            where: {
              OR: [
                {
                  id: idSearch,
                },
                {
                  name: { search },
                },
                {
                  email: { search },
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
    let user: User | null = null;

    if (isNaN(+identifier)) {
      user = await this.databaseService.user.findFirst({
        where: {
          id: +identifier,
        },
      });
    } else {
      user = await this.databaseService.user.findFirst({
        where: {
          email: identifier,
        },
      });
    }

    if (!user) {
      throw new NotFoundException(userNotFoundErr);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(`${id}`);

    if (!user) {
      throw new NotFoundException(userNotFoundErr);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...data } = updateUserDto;
    // omit password for the update method

    return this.databaseService.user
      .update({
        where: {
          id,
        },
        data,
      })
      .then(() => this.findOne(`${id}`));
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
