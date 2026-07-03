import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GroqService } from './groq.service';
import { GroqController } from './groq.controller';

@Module({
  imports: [ConfigModule],
  controllers: [GroqController],
  providers: [GroqService],
  exports: [GroqService],
})
export class GroqModule {}
