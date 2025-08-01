import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './common/services/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/services/auth/jwt-auth.guard';
import { JwtStrategy } from './common/services/auth/jwt.strategy';
import { UserModule } from './modules/user/user.module';
import { CategoryModule } from './modules/category/category.module';
import { MaterialModule } from './modules/material/material.module';
import { ItemModule } from './modules/item/item.module';
// import { DatabaseModule } from './core/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    AdminModule,
    UserModule,
    CategoryModule,
    MaterialModule,
    ItemModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    JwtStrategy,
  ],
})
export class AppModule {}
