import { Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Inquiries')
@Controller('inquiries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Get()
  @ApiOperation({ summary: 'List inquiries (admin: all, retailer: about my properties, client: my inquiries)' })
  findAll(@CurrentUser() user: { id: number; role: string }) {
    return this.inquiriesService.findAll(user.id, user.role);
  }

  @Post(':propertyId')
  @ApiOperation({ summary: 'Send an inquiry about a property' })
  create(
    @Body() dto: CreateInquiryDto,
    @CurrentUser('id') userId: number,
    @Param('propertyId', ParseIntPipe) propertyId: number,
  ) {
    return this.inquiriesService.create(dto, userId, propertyId);
  }
}
