import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: number): Promise<{
        message: string;
        type: string;
        title: string;
        id: number;
        createdAt: Date;
        link: string | null;
        userId: number;
        isRead: boolean;
    }[]>;
    getUnreadCount(userId: number): Promise<number>;
    markAsRead(id: number, userId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: number): Promise<import("@prisma/client").Prisma.BatchPayload>;
    create(data: {
        userId: number;
        title: string;
        message: string;
        type?: string;
        link?: string;
    }): Promise<{
        message: string;
        type: string;
        title: string;
        id: number;
        createdAt: Date;
        link: string | null;
        userId: number;
        isRead: boolean;
    }>;
}
