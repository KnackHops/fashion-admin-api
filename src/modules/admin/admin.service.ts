import { Injectable } from '@nestjs/common';
// import { CreateAdminDto } from './dto/create-admin.dto';
// import { UpdateAdminDto } from './dto/update-admin.dto';
import { Prisma } from '../../../generated/prisma';
import { DatabaseService } from 'src/core/database/database.service';

@Injectable()
export class AdminService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createAdminDto: Prisma.AdminCreateInput) {
    return this.databaseService.admin.create({
      data: createAdminDto,
    });
  }

  findAll() {
    return this.databaseService.admin.findMany();
  }

  findOne(id: number) {
    return this.databaseService.admin.findUnique({
      where: { id },
    });
  }

  update(id: number, updateAdminDto: Prisma.AdminUpdateInput) {
    return this.databaseService.admin.update({
      where: { id },
      data: updateAdminDto,
    });
  }

  remove(id: number) {
    return this.databaseService.admin.delete({
      where: { id },
    });
  }
}
