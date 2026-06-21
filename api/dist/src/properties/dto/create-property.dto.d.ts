import { PropertyType, TransactionType } from '@prisma/client';
export declare class CreatePropertyDto {
    title: string;
    description?: string;
    price: number;
    surface?: number;
    rooms?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: PropertyType;
    transactionType?: TransactionType;
    address?: string;
    city?: string;
    province?: string;
    latitude?: number;
    longitude?: number;
    images?: string[];
    features?: string[];
}
