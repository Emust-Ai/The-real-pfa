import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(userId: number): Promise<any>;
    getUnreadCount(userId: number): Promise<any>;
    markAsRead(id: number, userId: number): Promise<any>;
    markAllAsRead(userId: number): Promise<any>;
}
