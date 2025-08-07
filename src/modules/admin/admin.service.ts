import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from '../../../generated/prisma';
import { DatabaseService } from 'src/core/database/database.service';
import {
  emailExistsErr,
  passwordNotMatchErr,
  userExistsErr,
  userNotFoundErr,
} from 'src/common/constants';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';
import { HashService } from 'src/common/services/auth/hash.service';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly hashService: HashService,
  ) {}

  async create(createAdminDto: CreateAdminDto) {
    const exist = await this.findOne(createAdminDto.email).catch(() => null);

    if (exist) {
      throw new ConflictException(userExistsErr);
    }
    const { hash } = await this.hashService.generateAndHashPassword(
      createAdminDto.password,
    );

    return this.databaseService
      .$executeRaw`INSERT INTO "Admin" ("name", "email", "password", "updatedAt")
      VALUES (${createAdminDto.name},${createAdminDto.email},${hash}, now())`
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

  findAll(page?: number, perPage?: number, search?: string) {
    let actualPage = 0;
    const actualPerPage = perPage ?? 10;

    if (page) if (page > 0) actualPage = page - 1;

    const offset = actualPage * actualPerPage;

    return this.databaseService.$queryRawUnsafe(
      `SELECT "id", "createdAt", "updatedAt", "name", "email", "status" FROM "Admin" a WHERE a.name LIKE '%${search || ''}%' OR a.email LIKE '%${search || ''}%' ORDER BY a.id ASC LIMIT ${actualPerPage} OFFSET ${offset}`,
    );
  }

  async findOne(identifier: string, showPassword?: boolean) {
    let admin: null | Admin = null;

    if (isNaN(+identifier)) {
      const adminByEmail: Admin[] = showPassword
        ? await this.databaseService
            .$queryRaw`SELECT * FROM "Admin" a WHERE a.email LIKE ${identifier.trim()} ORDER BY a.id`
        : await this.databaseService
            .$queryRaw`SELECT "id", "createdAt", "updatedAt", "name", "email", "status" FROM "Admin" a WHERE a.email LIKE ${identifier.trim()} ORDER BY a.id`;

      if (adminByEmail.length > 0) admin = adminByEmail[0];
    } else {
      const adminById: Admin[] = showPassword
        ? await this.databaseService
            .$queryRaw`SELECT * FROM "Admin" a WHERE a.id = ${+identifier} ORDER BY a.id`
        : await this.databaseService
            .$queryRaw`SELECT "id", "createdAt", "updatedAt", "name", "email", "status" FROM "Admin" a WHERE a.id = ${+identifier} ORDER BY a.id`;

      if (adminById.length > 0) admin = adminById[0];
    }

    if (!admin) throw new NotFoundException(userNotFoundErr);

    return admin;
  }

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto) {
    const adminToUpdate = await this.findOne(`${id}`, true);

    if (!adminToUpdate) {
      throw new NotFoundException(userNotFoundErr);
    }

    if (
      !(await this.hashService.comparePassword(
        updatePasswordDto.previousPassword,
        adminToUpdate.password,
      ))
    ) {
      throw new UnauthorizedException(passwordNotMatchErr);
    }

    const newPassword = await this.hashService.hashPassword(
      updatePasswordDto.password,
    );

    await this.databaseService
      .$queryRaw`UPDATE "Admin" a SET "password"=${newPassword}, "updatedAt"=now() WHERE a.id = ${id}`.then(
      () => this.findOne(`${id}`).catch(() => null),
    );
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const adminToUpdate = await this.findOne(`${id}`);

    if (!adminToUpdate) {
      throw new NotFoundException(userNotFoundErr);
    }

    let updateColumn = '';
    if (updateAdminDto?.email && updateAdminDto.email !== adminToUpdate.email) {
      const exists = await this.findOne(updateAdminDto.email).catch(() => null);

      if (exists) throw new ConflictException(emailExistsErr);

      updateColumn = `"email"='${updateAdminDto.email}'`;
    }
    if (updateAdminDto?.name && updateAdminDto.name !== adminToUpdate.name)
      updateColumn = `${updateColumn ? `${updateColumn}, ` : ''}"name"='${updateAdminDto.name}'`;
    // if (updateAdminDto?.password) {
    //   const { hash } = await this.hashService.generateAndHashPassword(
    //     updateAdminDto.password,
    //   );
    //   updateColumn = `${updateColumn ? `${updateColumn}, ` : ''}"password"='${hash}'`;
    // }

    if (!updateColumn) return adminToUpdate;

    updateColumn = updateColumn + `, "updatedAt"=now()`;

    return await this.databaseService
      .$executeRawUnsafe(
        `UPDATE "Admin" a SET ${updateColumn.trim()} WHERE a.id = ${id}`,
      )
      .then(() => {
        return this.findOne(`${id}`);
      });
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
