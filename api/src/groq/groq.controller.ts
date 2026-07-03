import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GroqService } from './groq.service';
import { ParseSearchDto, ParseSearchResponse } from './dto/parse-search.dto';
import { GenerateDescriptionDto, GenerateDescriptionResponse } from './dto/generate-description.dto';
import { EnrichScrapedDto, EnrichScrapedResponse } from './dto/enrich-scraped.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('groq')
export class GroqController {
  constructor(private readonly groqService: GroqService) {}

  @Post('parse-search')
  @Roles(Role.CLIENT, Role.RETAILER, Role.BUILDER, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Parse natural language into search filters' })
  parseSearch(@Body() dto: ParseSearchDto): Promise<ParseSearchResponse> {
    return this.groqService.parseSearchQuery(dto.query);
  }

  @Post('generate-description')
  @Roles(Role.RETAILER, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a property description from details' })
  generateDescription(@Body() dto: GenerateDescriptionDto): Promise<GenerateDescriptionResponse> {
    return this.groqService.generateDescription(dto);
  }

  @Post('enrich-scraped')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enrich raw scraped text into structured property data' })
  enrichScraped(@Body() dto: EnrichScrapedDto): Promise<EnrichScrapedResponse> {
    return this.groqService.enrichScrapedData(dto.rawText);
  }
}
