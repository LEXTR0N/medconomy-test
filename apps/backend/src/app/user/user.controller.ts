import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }
    return user;
  }

  @Post()
  async create(@Body() userData: Partial<User> & { companyId?: string }): Promise<User> {
    return this.userService.create(userData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() userData: Partial<User> & { companyId?: string }): Promise<User> {
    const user = await this.userService.update(id, userData);
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }
    return user;
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    const deleted = await this.userService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }
  }

  @Post(':id/coworkers/:coworkerId')
  async addRelatedCoworker(
    @Param('id') id: string,
    @Param('coworkerId') coworkerId: string
  ): Promise<User> {
    const user = await this.userService.addRelatedCoworker(id, coworkerId);
    if (!user) {
      throw new NotFoundException(`User or coworker not found`);
    }
    return user;
  }

  @Delete(':id/coworkers/:coworkerId')
  async removeRelatedCoworker(
    @Param('id') id: string,
    @Param('coworkerId') coworkerId: string
  ): Promise<User> {
    const user = await this.userService.removeRelatedCoworker(id, coworkerId);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }
}