import { ScrapingService } from './scraping.service';
export declare class ScrapingController {
    private readonly scrapingService;
    constructor(scrapingService: ScrapingService);
    getSources(): Promise<any>;
    createSource(body: {
        name: string;
        baseUrl: string;
        selectors: any;
        usePuppeteer?: boolean;
        maxPages?: number;
        pageUrlPattern?: string;
        nextPageSelector?: string;
    }): Promise<any>;
    updateSource(id: number, body: {
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
    getJobs(sourceId?: string): Promise<any>;
    startJob(sourceId: number): Promise<any>;
    getResults(sourceName: string): Promise<any>;
}
