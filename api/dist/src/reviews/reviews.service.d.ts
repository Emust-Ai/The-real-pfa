import { PrismaService } from '../prisma/prisma.service';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    findByProperty(propertyId: number): Promise<({
        user: {
            firstName: string | null;
            lastName: string | null;
            id: number;
            avatar: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        propertyId: number;
        rating: number;
        comment: string | null;
    })[]>;
    create(userId: number, propertyId: number, data: {
        rating: number;
        comment?: string;
    }): Promise<{
        user: {
            firstName: string | null;
            lastName: string | null;
            id: number;
            avatar: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        propertyId: number;
        rating: number;
        comment: string | null;
    }>;
    remove(userId: number, reviewId: number, userRole: string): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        propertyId: number;
        rating: number;
        comment: string | null;
    }>;
}
