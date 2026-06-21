import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
export declare class InquiriesController {
    private readonly inquiriesService;
    constructor(inquiriesService: InquiriesService);
    findAll(user: {
        id: number;
        role: string;
    }): Promise<({
        property: {
            title: string;
            id: number;
        };
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        propertyId: number;
        message: string;
    })[]>;
    create(dto: CreateInquiryDto, userId: number, propertyId: number): Promise<{
        property: {
            title: string;
            id: number;
        };
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        propertyId: number;
        message: string;
    }>;
}
