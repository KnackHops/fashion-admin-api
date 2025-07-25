import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { DatabaseModule } from 'src/core/database/database.module';

@Module({
  controllers: [CategoryController, DatabaseModule],
  providers: [CategoryService],
})
export class CategoryModule {}
