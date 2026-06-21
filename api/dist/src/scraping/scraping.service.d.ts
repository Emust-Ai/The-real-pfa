import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ScrapingService {
    private prisma;
    private notificationsService;
    private readonly logger;
    private defaultRetailerId;
    private botInitPromise;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    private ensureScrapingBot;
    getSources(): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        baseUrl: string;
        selectors: import("@prisma/client/runtime/client").JsonValue;
        usePuppeteer: boolean;
    }[]>;
    createSource(data: {
        name: string;
        baseUrl: string;
        selectors: any;
        usePuppeteer?: boolean;
    }): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        baseUrl: string;
        selectors: import("@prisma/client/runtime/client").JsonValue;
        usePuppeteer: boolean;
    }>;
    updateSource(id: number, data: {
        name?: string;
        baseUrl?: string;
        selectors?: any;
        isActive?: boolean;
        usePuppeteer?: boolean;
    }): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        baseUrl: string;
        selectors: import("@prisma/client/runtime/client").JsonValue;
        usePuppeteer: boolean;
    }>;
    deleteSource(id: number): Promise<void>;
    getJobs(sourceId?: number): Promise<({
        source: {
            id: number;
            name: string;
        };
    } & {
        error: string | null;
        id: number;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ScrapingJobStatus;
        sourceId: number;
        totalUrls: number;
        scrapedUrls: number;
        failedUrls: number;
        propertiesFound: number;
        startedAt: Date | null;
        completedAt: Date | null;
    })[]>;
    startJob(sourceId: number): Promise<{
        error: string | null;
        id: number;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ScrapingJobStatus;
        sourceId: number;
        totalUrls: number;
        scrapedUrls: number;
        failedUrls: number;
        propertiesFound: number;
        startedAt: Date | null;
        completedAt: Date | null;
    }>;
    private runJob;
    private notifyAdmins;
    private hash;
    private upsertProperty;
    private scrapeUrl;
    private scrapeWithCheerio;
    private scrapeWithPuppeteer;
    private extractListings;
    getResults(sourceName: string): Promise<({
        _count: {
            favorites: number;
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
    })[]>;
    private parsePrice;
}
