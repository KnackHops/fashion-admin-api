import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { DatabaseModule } from 'src/core/database/database.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DatabaseModule, UserModule],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
