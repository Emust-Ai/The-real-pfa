import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParseSearchDto {
  @ApiProperty({ example: '3 bedroom apartment in Tunis under 500k' })
  @IsString()
  query: string;
}

export class ParsedSearchFilters {
  @ApiProperty({ required: false })
  search?: string;

  @ApiProperty({ required: false })
  propertyType?: string;

  @ApiProperty({ required: false })
  transactionType?: string;

  @ApiProperty({ required: false })
  minPrice?: number;

  @ApiProperty({ required: false })
  maxPrice?: number;

  @ApiProperty({ required: false })
  rooms?: number;

  @ApiProperty({ required: false })
  bedrooms?: number;

  @ApiProperty({ required: false })
  city?: string;
}

export class ParseSearchResponse {
  @ApiProperty()
  filters: ParsedSearchFilters;

  @ApiProperty()
  summary: string;
}
