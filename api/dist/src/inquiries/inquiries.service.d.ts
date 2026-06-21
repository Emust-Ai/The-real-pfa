import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class InquiriesService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    create(dto: CreateInquiryDto, userId: number, propertyId: number): Promise<{
        property: {
            title: string;
            id: number;
        };
    } & {
        message: string;
        id: number;
        createdAt: Date;
        userId: number;
        propertyId: number;
    }>;
    findAll(userId: number, userRole: string): Promise<({
        property: {
            title: string;
            id: number;
        };
    } & {
        message: string;
        id: number;
        createdAt: Date;
        userId: number;
        propertyId: number;
    })[]>;
}
