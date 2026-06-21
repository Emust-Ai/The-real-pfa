import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ScrapingService } from './scraping.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Scraping')
@Controller('scraping')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@ApiBearerAuth()
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Get('sources')
  @ApiOperation({ summary: 'List all scraping sources' })
  getSources() {
    return this.scrapingService.getSources();
  }

  @Post('sources')
  @ApiOperation({ summary: 'Create a scraping source' })
  createSource(@Body() body: { name: string; baseUrl: string; selectors: any; usePuppeteer?: boolean; maxPages?: number; pageUrlPattern?: string; nextPageSelector?: string }) {
    return this.scrapingService.createSource(body);
  }

  @Patch('sources/:id')
  @ApiOperation({ summary: 'Update a scraping source' })
  updateSource(@Param('id', ParseIntPipe) id: number, @Body() body: { name?: string; baseUrl?: string; selectors?: any; isActive?: boolean; usePuppeteer?: boolean; maxPages?: number; pageUrlPattern?: string; nextPageSelector?: string }) {
    return this.scrapingService.updateSource(id, body);
  }

  @Delete('sources/:id')
  @ApiOperation({ summary: 'Delete a scraping source' })
  deleteSource(@Param('id', ParseIntPipe) id: number) {
    return this.scrapingService.deleteSource(id);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List scraping jobs' })
  getJobs(@Query('sourceId') sourceId?: string) {
    return this.scrapingService.getJobs(sourceId ? parseInt(sourceId) : undefined);
  }

  @Post('jobs/:sourceId/start')
  @ApiOperation({ summary: 'Start a scraping job for a source' })
  startJob(@Param('sourceId', ParseIntPipe) sourceId: number) {
    return this.scrapingService.startJob(sourceId);
  }

  @Get('results/:sourceName')
  @ApiOperation({ summary: 'Get properties scraped from a source' })
  getResults(@Param('sourceName') sourceName: string) {
    return this.scrapingService.getResults(sourceName);
  }
}
