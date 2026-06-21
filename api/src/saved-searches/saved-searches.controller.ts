import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SavedSearchesService } from './saved-searches.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Saved Searches')
@Controller('saved-searches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Get()
  @ApiOperation({ summary: 'List my saved searches' })
  findAll(@CurrentUser('id') userId: number) {
    return this.savedSearchesService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a saved search' })
  create(@Body() dto: CreateSavedSearchDto, @CurrentUser('id') userId: number) {
    return this.savedSearchesService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a saved search (owner)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSavedSearchDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.savedSearchesService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a saved search (owner)' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.savedSearchesService.remove(id, userId);
  }
}
