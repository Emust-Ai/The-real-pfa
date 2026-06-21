import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagingService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createConversation(propertyId: number, userId: number) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, retailerId: true, title: true },
    });
    if (!property) throw new NotFoundException('Property not found');

    const otherUserId = property.retailerId;
    if (otherUserId === userId) throw new ForbiddenException('Cannot start conversation with yourself');

    const existing = await this.prisma.conversation.findFirst({
      where: {
        propertyId,
        participants: {
          every: {
            userId: { in: [userId, otherUserId] },
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (existing) {
      const allMatch = existing.participants.length === 2 &&
        existing.participants.every(p => p.userId === userId || p.userId === otherUserId);
      if (allMatch) return existing;
    }

    return this.prisma.conversation.create({
      data: {
        propertyId,
        participants: {
          createMany: {
            data: [
              { userId },
              { userId: otherUserId },
            ],
          },
        },
      },
      include: {
        participants: true,
      },
    });
  }

  async getConversations(userId: number) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        property: {
          select: { id: true, title: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const unreadCounts = await Promise.all(
      conversations.map(conv =>
        this.prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false,
          },
        })
      ),
    );

    return conversations.map((conv, i) => ({
      id: conv.id,
      property: conv.property,
      participants: conv.participants,
      lastMessage: conv.messages[0] ?? null,
      unreadCount: unreadCounts[i],
      updatedAt: conv.updatedAt,
    }));
  }

  async getMessages(conversationId: number, userId: number) {
    await this.verifyParticipant(conversationId, userId);

    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    await this.prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: new Date() },
    });

    return this.prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(conversationId: number, userId: number, content: string) {
    const conv = await this.verifyParticipant(conversationId, userId);

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    const recipient = conv.participants.find(p => p.userId !== userId);
    if (recipient) {
      await this.notificationsService.create({
        userId: recipient.userId,
        title: 'New Message',
        message: content.length > 100 ? content.slice(0, 100) + '...' : content,
        type: 'MESSAGE',
        link: `/conversations?open=${conversationId}`,
      });
    }

    return message;
  }

  async getUnreadCount(userId: number) {
    const convs = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      select: { id: true },
    });

    if (convs.length === 0) return 0;

    const count = await this.prisma.message.count({
      where: {
        conversationId: { in: convs.map(c => c.id) },
        senderId: { not: userId },
        isRead: false,
      },
    });

    return count;
  }

  private async verifyParticipant(conversationId: number, userId: number) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });
    if (!conv) throw new NotFoundException('Conversation not found');

    const isParticipant = conv.participants.some(p => p.userId === userId);
    if (!isParticipant) throw new ForbiddenException('Not a participant of this conversation');

    return conv;
  }
}
