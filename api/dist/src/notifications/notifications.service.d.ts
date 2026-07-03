import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: number): Promise<any>;
    getUnreadCount(userId: number): Promise<any>;
    markAsRead(id: number, userId: number): Promise<any>;
    markAllAsRead(userId: number): Promise<any>;
    create(data: {
        userId: number;
        title: string;
        message: string;
        type?: string;
        link?: string;
    }): Promise<any>;
}
