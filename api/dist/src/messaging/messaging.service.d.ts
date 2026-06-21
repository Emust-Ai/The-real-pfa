import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class MessagingService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    createConversation(propertyId: number, userId: number): Promise<{
        participants: {
            id: number;
            userId: number;
            conversationId: number;
            lastReadAt: Date | null;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        propertyId: number;
    }>;
    getConversations(userId: number): Promise<{
        id: number;
        property: {
            title: string;
            id: number;
        };
        participants: ({
            user: {
                email: string;
                firstName: string | null;
                lastName: string | null;
                id: number;
            };
        } & {
            id: number;
            userId: number;
            conversationId: number;
            lastReadAt: Date | null;
        })[];
        lastMessage: {
            id: number;
            createdAt: Date;
            isRead: boolean;
            senderId: number;
            content: string;
        };
        unreadCount: number;
        updatedAt: Date;
    }[]>;
    getMessages(conversationId: number, userId: number): Promise<({
        sender: {
            firstName: string | null;
            lastName: string | null;
            id: number;
        };
    } & {
        id: number;
        createdAt: Date;
        isRead: boolean;
        conversationId: number;
        senderId: number;
        content: string;
    })[]>;
    sendMessage(conversationId: number, userId: number, content: string): Promise<{
        sender: {
            firstName: string | null;
            lastName: string | null;
            id: number;
        };
    } & {
        id: number;
        createdAt: Date;
        isRead: boolean;
        conversationId: number;
        senderId: number;
        content: string;
    }>;
    getUnreadCount(userId: number): Promise<number>;
    private verifyParticipant;
}
