import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    findAll(query: QueryPropertyDto): Promise<{
        data: ({
            _count: {
                favorites: number;
            };
            retailer: {
                email: string;
                firstName: string | null;
                lastName: string | null;
                id: number;
            };
        } & {
            scrapedFrom: string | null;
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
            sourceUrl: string | null;
            sourceUrlHash: string | null;
            retailerId: number;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findMy(userId: number): Promise<({
        _count: {
            favorites: number;
            inquiries: number;
        };
    } & {
        scrapedFrom: string | null;
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
        sourceUrl: string | null;
        sourceUrlHash: string | null;
        retailerId: number;
    })[]>;
    findOne(id: number): Promise<{
        _count: {
            favorites: number;
            inquiries: number;
        };
        retailer: {
            email: string;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            id: number;
        };
    } & {
        scrapedFrom: string | null;
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
        sourceUrl: string | null;
        sourceUrlHash: string | null;
        retailerId: number;
    }>;
    create(dto: CreatePropertyDto, userId: number): Promise<{
        retailer: {
            email: string;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            id: number;
        };
    } & {
        scrapedFrom: string | null;
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
        sourceUrl: string | null;
        sourceUrlHash: string | null;
        retailerId: number;
    }>;
    update(id: number, dto: UpdatePropertyDto, user: {
        id: number;
        role: string;
    }): Promise<{
        retailer: {
            email: string;
            firstName: string | null;
            lastName: string | null;
            id: number;
        };
    } & {
        scrapedFrom: string | null;
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
        sourceUrl: string | null;
        sourceUrlHash: string | null;
        retailerId: number;
    }>;
    remove(id: number, user: {
        id: number;
        role: string;
    }): Promise<void>;
}
