import { PrismaService } from '../prisma/prisma.service';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    findByProperty(propertyId: number): Promise<any>;
    create(userId: number, propertyId: number, data: {
        rating: number;
        comment?: string;
    }): Promise<any>;
    remove(userId: number, reviewId: number, userRole: string): Promise<any>;
}
