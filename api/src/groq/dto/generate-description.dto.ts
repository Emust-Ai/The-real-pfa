import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateDescriptionDto {
  @ApiProperty({ example: 'Modern apartment with sea view' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'APARTMENT' })
  @IsString()
  propertyType: string;

  @ApiPropertyOptional({ example: ['Balcony', 'Parking', 'Pool'] })
  @IsArray()
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ example: 'Tunis' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 120 })
  @IsNumber()
  @IsOptional()
  surface?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @IsOptional()
  rooms?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @ApiPropertyOptional({ example: 450000 })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 'SALE' })
  @IsString()
  @IsOptional()
  transactionType?: string;
}

export class GenerateDescriptionResponse {
  @ApiProperty()
  description: string;
}
