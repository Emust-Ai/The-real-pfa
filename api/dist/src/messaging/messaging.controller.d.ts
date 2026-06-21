import { MessagingService } from './messaging.service';
export declare class MessagingController {
    private readonly messagingService;
    constructor(messagingService: MessagingService);
    createConversation(userId: number, propertyId: number): Promise<{
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
    getUnreadCount(userId: number): Promise<number>;
    getMessages(userId: number, id: number): Promise<({
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
    sendMessage(userId: number, id: number, content: string): Promise<{
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
}
