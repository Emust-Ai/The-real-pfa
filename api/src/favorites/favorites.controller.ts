import { Controller, Get, Post, Delete, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'List my favorites' })
  findAll(@CurrentUser('id') userId: number) {
    return this.favoritesService.findAll(userId);
  }

  @Post(':propertyId')
  @ApiOperation({ summary: 'Add property to favorites' })
  add(@CurrentUser('id') userId: number, @Param('propertyId', ParseIntPipe) propertyId: number) {
    return this.favoritesService.add(userId, propertyId);
  }

  @Delete(':propertyId')
  @ApiOperation({ summary: 'Remove property from favorites' })
  remove(@CurrentUser('id') userId: number, @Param('propertyId', ParseIntPipe) propertyId: number) {
    return this.favoritesService.remove(userId, propertyId);
  }
}
