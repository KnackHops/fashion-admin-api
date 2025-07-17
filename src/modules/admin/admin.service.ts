import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from '../../../generated/prisma';
import { DatabaseService } from 'src/core/database/database.service';
import {
  emailExistsErr,
  userExistsErr,
  userNotFoundErr,
} from 'src/common/errorMessages';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

@Injectable()
export class AdminService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createAdminDto: CreateAdminDto) {
    // const exist = await this.findOne(createAdminDto.email).catch(() => null);

    // if (exist) {
    //   throw new ConflictException(userExistsErr);
    // }

    return this.databaseService
      .$executeRaw`INSERT INTO "Admin" ("name", "email", "password", "updatedAt")
      VALUES (${createAdminDto.name},${createAdminDto.email},${createAdminDto.password}, now())`
      .then(() => {
        return this.findOne(createAdminDto.email);
      })
      .catch((e) => {
        if ((e as PrismaClientKnownRequestError)?.meta?.message) {
          const { meta } = e as PrismaClientKnownRequestError;

          if (meta) {
            const { message } = meta as { message: string };

            if (message.includes('already exists'))
              throw new ConflictException(userExistsErr);
          }
        }
        throw e;
      });
  }

  findAll(page?: number, perPage?: number) {
    let actualPage = 0;
    const actualPerPage = perPage ?? 10;

    if (page) if (page > 0) actualPage = page - 1;

    const offset = actualPage * actualPerPage;
    return this.databaseService
      .$queryRaw`SELECT * FROM "Admin" a ORDER BY a.id ASC LIMIT ${actualPerPage} OFFSET ${offset}`;
  }

  async findOne(identifier: string) {
    let admin: null | Admin = null;

    if (isNaN(+identifier)) {
      const adminByEmail: Admin[] = await this.databaseService
        .$queryRaw`SELECT * FROM "Admin" a WHERE a.email LIKE ${identifier.trim()} ORDER BY a.id`;

      if (adminByEmail.length > 0) admin = adminByEmail[0];
    } else {
      const adminById: Admin[] = await this.databaseService
        .$queryRaw`SELECT * FROM "Admin" a WHERE a.id = ${+identifier} ORDER BY a.id`;

      if (adminById.length > 0) admin = adminById[0];
    }

    if (!admin) throw new NotFoundException(userNotFoundErr);

    return admin;
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const adminToUpdate = await this.findOne(`${id}`).catch(() => null);

    if (!adminToUpdate) {
      throw new NotFoundException(userNotFoundErr);
    }

    let updateColumn = '';
    if (updateAdminDto?.email && updateAdminDto.email !== adminToUpdate.email) {
      const exists = await this.findOne(updateAdminDto.email).catch(() => null);

      if (exists) throw new ConflictException(emailExistsErr);

      updateColumn = `"email" = '${updateAdminDto.email}'`;
    }
    if (updateAdminDto?.name && updateAdminDto.name !== adminToUpdate.name)
      updateColumn = `${updateColumn ? `${updateColumn}, ` : ''}"name" = '${updateAdminDto.name}'`;
    if (
      updateAdminDto?.password &&
      updateAdminDto.password !== adminToUpdate.password
    )
      updateColumn = `${updateColumn ? `${updateColumn}, ` : ''}"password" = '${updateAdminDto.password}'`;

    if (!updateColumn) return adminToUpdate;

    return await this.databaseService
      .$executeRawUnsafe(
        `UPDATE "Admin" a SET ${updateColumn.trim()}, "updatedAt"=now() WHERE a.id = ${id}`,
      )
      .then(() => {
        return this.findOne(`${id}`).catch(() => null);
      });
  }

  remove(id: number) {
    return this.databaseService.admin.delete({
      where: { id },
    });
  }
}
