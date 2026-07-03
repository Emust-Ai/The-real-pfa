import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnrichScrapedDto {
  @ApiProperty({ example: 'Beautiful 3BR apartment for sale in Tunis Centre. 120m2, balcony, parking...' })
  @IsString()
  rawText: string;

  @ApiPropertyOptional({ example: 'https://example.com/property/123' })
  @IsString()
  @IsOptional()
  url?: string;
}

export class EnrichedData {
  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  price?: number;

  @ApiProperty({ required: false })
  surface?: number;

  @ApiProperty({ required: false })
  rooms?: number;

  @ApiProperty({ required: false })
  bedrooms?: number;

  @ApiProperty({ required: false })
  bathrooms?: number;

  @ApiProperty({ required: false })
  propertyType?: string;

  @ApiProperty({ required: false })
  city?: string;

  @ApiProperty({ required: false })
  features?: string[];
}

export class EnrichScrapedResponse {
  @ApiProperty()
  data: EnrichedData;
}
