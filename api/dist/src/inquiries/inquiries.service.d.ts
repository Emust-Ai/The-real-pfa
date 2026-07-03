import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class InquiriesService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    create(dto: CreateInquiryDto, userId: number, propertyId: number): Promise<any>;
    findAll(userId: number, userRole: string): Promise<any>;
}
