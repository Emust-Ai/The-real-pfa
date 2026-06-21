import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { Prisma } from '@prisma/client';
export declare class PropertiesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreatePropertyDto, retailerId: number): Promise<{
        retailer: {
            email: string;
            firstName: string | null;
            lastName: string | null;
            phone: string | null;
            id: number;
        };
    } & {
        description: string | null;
        title: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        price: Prisma.Decimal;
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
    }>;
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
            description: string | null;
            title: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: Prisma.Decimal;
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
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
        description: string | null;
        title: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        price: Prisma.Decimal;
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
    }>;
    update(id: number, dto: UpdatePropertyDto, userId: number, userRole: string): Promise<{
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
        price: Prisma.Decimal;
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
    }>;
    remove(id: number, userId: number, userRole: string): Promise<void>;
    findMyProperties(userId: number): Promise<({
        _count: {
            favorites: number;
            inquiries: number;
        };
    } & {
        description: string | null;
        title: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        price: Prisma.Decimal;
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
    })[]>;
}
