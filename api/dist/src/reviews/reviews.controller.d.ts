import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findByProperty(propertyId: number): Promise<any>;
    create(propertyId: number, userId: number, data: {
        rating: number;
        comment?: string;
    }): Promise<any>;
    remove(id: number, user: {
        id: number;
        role: string;
    }): Promise<any>;
}
