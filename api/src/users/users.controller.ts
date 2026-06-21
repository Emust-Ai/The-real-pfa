import { Controller, Get, Param, Patch, Delete, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @Roles(Role.SUPER_ADMIN)
  updateRole(@Param('id', ParseIntPipe) id: number, @Body('role') role: Role) {
    return this.usersService.updateRole(id, role);
  }

  @Patch(':id/toggle-active')
  @Roles(Role.SUPER_ADMIN)
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleActive(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: { firstName?: string; lastName?: string; phone?: string }) {
    return this.usersService.update(id, body);
  }

  @Patch(':id/password')
  @Roles(Role.SUPER_ADMIN)
  updatePassword(@Param('id', ParseIntPipe) id: number, @Body('password') password: string) {
    return this.usersService.updatePassword(id, password);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
