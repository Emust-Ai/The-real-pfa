import { Controller, Get, Post, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('properties/:propertyId/reviews')
  @ApiOperation({ summary: 'Get all reviews for a property' })
  findByProperty(@Param('propertyId', ParseIntPipe) propertyId: number) {
    return this.reviewsService.findByProperty(propertyId);
  }

  @Post('properties/:propertyId/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for a property' })
  create(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @CurrentUser('id') userId: number,
    @Body() data: { rating: number; comment?: string },
  ) {
    return this.reviewsService.create(userId, propertyId, data);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review (owner or SUPER_ADMIN)' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.reviewsService.remove(user.id, id, user.role);
  }
}
