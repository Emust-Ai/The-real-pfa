import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInquiryDto {
  @ApiProperty()
  @IsString()
  @MinLength(10)
  message: string;
}
