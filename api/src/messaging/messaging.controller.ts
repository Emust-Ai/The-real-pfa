import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Messaging')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('properties/:propertyId/conversation')
  @ApiOperation({ summary: 'Create or get existing conversation for a property' })
  createConversation(
    @CurrentUser('id') userId: number,
    @Param('propertyId', ParseIntPipe) propertyId: number,
  ) {
    return this.messagingService.createConversation(propertyId, userId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List my conversations' })
  getConversations(@CurrentUser('id') userId: number) {
    return this.messagingService.getConversations(userId);
  }

  @Get('conversations/unread/count')
  @ApiOperation({ summary: 'Get total unread message count' })
  getUnreadCount(@CurrentUser('id') userId: number) {
    return this.messagingService.getUnreadCount(userId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  getMessages(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.messagingService.getMessages(id, userId);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message' })
  sendMessage(
    @CurrentUser('id') userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body('content') content: string,
  ) {
    return this.messagingService.sendMessage(id, userId, content);
  }
}
