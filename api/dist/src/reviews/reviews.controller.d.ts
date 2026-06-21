import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
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
    create(propertyId: number, userId: number, data: {
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
    remove(id: number, user: {
        id: number;
        role: string;
    }): Promise<{
        id: number;
        createdAt: Date;
        userId: number;
        propertyId: number;
        rating: number;
        comment: string | null;
    }>;
}
