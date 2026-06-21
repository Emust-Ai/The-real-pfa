import { PropertyType, TransactionType, PropertyStatus } from '@prisma/client';
export declare class QueryPropertyDto {
    propertyType?: PropertyType;
    transactionType?: TransactionType;
    status?: PropertyStatus;
    city?: string;
    province?: string;
    search?: string;
    scrapedFrom?: string;
    minPrice?: number;
    maxPrice?: number;
    minSurface?: number;
    maxSurface?: number;
    rooms?: number;
    bedrooms?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
