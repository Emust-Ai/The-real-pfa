import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(userId: number): Promise<{
        type: string;
        title: string;
        id: number;
        createdAt: Date;
        link: string | null;
        userId: number;
        message: string;
        isRead: boolean;
    }[]>;
    getUnreadCount(userId: number): Promise<number>;
    markAsRead(id: number, userId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
