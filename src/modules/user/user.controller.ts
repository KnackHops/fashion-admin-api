import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('perPage', new ParseIntPipe({ optional: true })) perPage?: number,
    @Query('search') search?: string,
  ) {
    return this.userService.findAll(page, perPage, search);
  }

  @Get(':identifier')
  findOne(@Param('identifier') identifier: string) {
    return this.userService.findOne(identifier);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
