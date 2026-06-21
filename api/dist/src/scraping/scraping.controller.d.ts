import { ScrapingService } from './scraping.service';
export declare class ScrapingController {
    private readonly scrapingService;
    constructor(scrapingService: ScrapingService);
    getSources(): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        baseUrl: string;
        selectors: import("@prisma/client/runtime/client").JsonValue;
        usePuppeteer: boolean;
        maxPages: number;
        pageUrlPattern: string | null;
        nextPageSelector: string | null;
    }[]>;
    createSource(body: {
        name: string;
        baseUrl: string;
        selectors: any;
        usePuppeteer?: boolean;
        maxPages?: number;
        pageUrlPattern?: string;
        nextPageSelector?: string;
    }): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        baseUrl: string;
        selectors: import("@prisma/client/runtime/client").JsonValue;
        usePuppeteer: boolean;
        maxPages: number;
        pageUrlPattern: string | null;
        nextPageSelector: string | null;
    }>;
    updateSource(id: number, body: {
        name?: string;
        baseUrl?: string;
        selectors?: any;
        isActive?: boolean;
        usePuppeteer?: boolean;
        maxPages?: number;
        pageUrlPattern?: string;
        nextPageSelector?: string;
    }): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        baseUrl: string;
        selectors: import("@prisma/client/runtime/client").JsonValue;
        usePuppeteer: boolean;
        maxPages: number;
        pageUrlPattern: string | null;
        nextPageSelector: string | null;
    }>;
    deleteSource(id: number): Promise<void>;
    getJobs(sourceId?: string): Promise<({
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
    getResults(sourceName: string): Promise<({
        _count: {
            favorites: number;
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
}
