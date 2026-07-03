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
    getSources(): Promise<any>;
    createSource(data: {
        name: string;
        baseUrl: string;
        selectors: any;
        usePuppeteer?: boolean;
        maxPages?: number;
        pageUrlPattern?: string;
        nextPageSelector?: string;
    }): Promise<any>;
    updateSource(id: number, data: {
        name?: string;
        baseUrl?: string;
        selectors?: any;
        isActive?: boolean;
        usePuppeteer?: boolean;
        maxPages?: number;
        pageUrlPattern?: string;
        nextPageSelector?: string;
    }): Promise<any>;
    deleteSource(id: number): Promise<void>;
    getJobs(sourceId?: number): Promise<any>;
    startJob(sourceId: number): Promise<any>;
    private runJob;
    private notifyAdmins;
    private hash;
    private upsertProperty;
    private scrapeUrl;
    private scrapeWithCheerio;
    private scrapeWithPuppeteer;
    private extractListings;
    getResults(sourceName: string): Promise<any>;
    private parsePrice;
}
