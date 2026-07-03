import { MessagingService } from './messaging.service';
export declare class MessagingController {
    private readonly messagingService;
    constructor(messagingService: MessagingService);
    createConversation(userId: number, propertyId: number): Promise<any>;
    getConversations(userId: number): Promise<any>;
    getUnreadCount(userId: number): Promise<any>;
    getMessages(userId: number, id: number): Promise<any>;
    sendMessage(userId: number, id: number, content: string): Promise<any>;
}
