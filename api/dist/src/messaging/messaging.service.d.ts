import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class MessagingService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    createConversation(propertyId: number, userId: number): Promise<any>;
    getConversations(userId: number): Promise<any>;
    getMessages(conversationId: number, userId: number): Promise<any>;
    sendMessage(conversationId: number, userId: number, content: string): Promise<any>;
    getUnreadCount(userId: number): Promise<any>;
    private verifyParticipant;
}
