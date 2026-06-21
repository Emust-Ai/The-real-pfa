"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let MessagingService = class MessagingService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async createConversation(propertyId, userId) {
        const property = await this.prisma.property.findUnique({
            where: { id: propertyId },
            select: { id: true, retailerId: true, title: true },
        });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        const otherUserId = property.retailerId;
        if (otherUserId === userId)
            throw new common_1.ForbiddenException('Cannot start conversation with yourself');
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
            if (allMatch)
                return existing;
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
    async getConversations(userId) {
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
        const unreadCounts = await Promise.all(conversations.map(conv => this.prisma.message.count({
            where: {
                conversationId: conv.id,
                senderId: { not: userId },
                isRead: false,
            },
        })));
        return conversations.map((conv, i) => ({
            id: conv.id,
            property: conv.property,
            participants: conv.participants,
            lastMessage: conv.messages[0] ?? null,
            unreadCount: unreadCounts[i],
            updatedAt: conv.updatedAt,
        }));
    }
    async getMessages(conversationId, userId) {
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
    async sendMessage(conversationId, userId, content) {
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
    async getUnreadCount(userId) {
        const convs = await this.prisma.conversation.findMany({
            where: {
                participants: {
                    some: { userId },
                },
            },
            select: { id: true },
        });
        if (convs.length === 0)
            return 0;
        const count = await this.prisma.message.count({
            where: {
                conversationId: { in: convs.map(c => c.id) },
                senderId: { not: userId },
                isRead: false,
            },
        });
        return count;
    }
    async verifyParticipant(conversationId, userId) {
        const conv = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: true,
            },
        });
        if (!conv)
            throw new common_1.NotFoundException('Conversation not found');
        const isParticipant = conv.participants.some(p => p.userId === userId);
        if (!isParticipant)
            throw new common_1.ForbiddenException('Not a participant of this conversation');
        return conv;
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map