import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
export declare class InquiriesController {
    private readonly inquiriesService;
    constructor(inquiriesService: InquiriesService);
    findAll(user: {
        id: number;
        role: string;
    }): Promise<any>;
    create(dto: CreateInquiryDto, userId: number, propertyId: number): Promise<any>;
}
