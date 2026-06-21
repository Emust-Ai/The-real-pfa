import { PrismaService } from '../prisma/prisma.service';
export declare class FavoritesService {
    private prisma;
    constructor(prisma: PrismaService);
    add(userId: number, propertyId: number): Promise<{
        property: {
            description: string | null;
            title: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            surface: number | null;
            rooms: number | null;
            bedrooms: number | null;
            bathrooms: number | null;
            propertyType: import("@prisma/client").$Enums.PropertyType;
            transactionType: import("@prisma/client").$Enums.TransactionType;
            address: string | null;
            city: string | null;
            province: string | null;
            latitude: number | null;
            longitude: number | null;
            images: string[];
            features: string[];
            status: import("@prisma/client").$Enums.PropertyStatus;
            scrapedFrom: string | null;
            sourceUrl: string | null;
            sourceUrlHash: string | null;
            retailerId: number;
        };
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        propertyId: number;
    }>;
    remove(userId: number, propertyId: number): Promise<void>;
    findAll(userId: number): Promise<({
        property: {
            retailer: {
                email: string;
                firstName: string | null;
                lastName: string | null;
                id: number;
            };
        } & {
            description: string | null;
            title: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: import("@prisma/client-runtime-utils").Decimal;
            surface: number | null;
            rooms: number | null;
            bedrooms: number | null;
            bathrooms: number | null;
            propertyType: import("@prisma/client").$Enums.PropertyType;
            transactionType: import("@prisma/client").$Enums.TransactionType;
            address: string | null;
            city: string | null;
            province: string | null;
            latitude: number | null;
            longitude: number | null;
            images: string[];
            features: string[];
            status: import("@prisma/client").$Enums.PropertyStatus;
            scrapedFrom: string | null;
            sourceUrl: string | null;
            sourceUrlHash: string | null;
            retailerId: number;
        };
    } & {
        id: number;
        createdAt: Date;
        userId: number;
        propertyId: number;
    })[]>;
}
