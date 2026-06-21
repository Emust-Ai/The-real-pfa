"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ScrapingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const crypto = __importStar(require("crypto"));
let ScrapingService = ScrapingService_1 = class ScrapingService {
    prisma;
    notificationsService;
    logger = new common_1.Logger(ScrapingService_1.name);
    defaultRetailerId = null;
    botInitPromise = null;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async ensureScrapingBot() {
        if (this.defaultRetailerId !== null)
            return;
        if (this.botInitPromise)
            return this.botInitPromise;
        this.botInitPromise = (async () => {
            try {
                let bot = await this.prisma.user.findUnique({ where: { email: 'scraping@bot.local' } });
                if (!bot) {
                    bot = await this.prisma.user.create({
                        data: {
                            email: 'scraping@bot.local',
                            password: '$2b$10$placeholder',
                            firstName: 'Scraping',
                            lastName: 'Bot',
                            role: 'RETAILER',
                        },
                    });
                    this.logger.log('Created Scraping Bot user');
                }
                this.defaultRetailerId = bot.id;
            }
            catch (err) {
                this.logger.warn(`Could not ensure scraping bot: ${err.message}, falling back to ID 1`);
                this.defaultRetailerId = 1;
            }
        })();
        return this.botInitPromise;
    }
    async getSources() {
        return this.prisma.scrapingSource.findMany({ orderBy: { createdAt: 'desc' } });
    }
    async createSource(data) {
        return this.prisma.scrapingSource.create({
            data: { name: data.name, baseUrl: data.baseUrl, selectors: data.selectors, usePuppeteer: data.usePuppeteer ?? false, maxPages: data.maxPages ?? 1, pageUrlPattern: data.pageUrlPattern, nextPageSelector: data.nextPageSelector },
        });
    }
    async updateSource(id, data) {
        return this.prisma.scrapingSource.update({
            where: { id },
            data: { ...data, selectors: data.selectors ?? undefined },
        });
    }
    async deleteSource(id) {
        await this.prisma.scrapingSource.delete({ where: { id } });
    }
    async getJobs(sourceId) {
        const where = sourceId ? { sourceId } : {};
        return this.prisma.scrapingJob.findMany({
            where,
            include: { source: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async startJob(sourceId) {
        const source = await this.prisma.scrapingSource.findUnique({ where: { id: sourceId } });
        if (!source)
            throw new Error('Source not found');
        const job = await this.prisma.scrapingJob.create({
            data: { sourceId, status: 'PENDING' },
        });
        this.runJob(job.id, source).catch((err) => {
            this.logger.error(`Job ${job.id} failed: ${err.message}`);
        });
        return job;
    }
    async runJob(jobId, source) {
        await this.prisma.scrapingJob.update({
            where: { id: jobId },
            data: { status: 'RUNNING', startedAt: new Date() },
        });
        try {
            let urls = [source.baseUrl];
            if (source.maxPages > 1) {
                if (source.pageUrlPattern) {
                    urls = [];
                    for (let p = 1; p <= source.maxPages; p++) {
                        urls.push(source.baseUrl + source.pageUrlPattern.replace('{page}', String(p)));
                    }
                }
                else if (source.nextPageSelector) {
                    urls = [source.baseUrl];
                }
            }
            let scraped = 0;
            let failed = 0;
            let totalFound = 0;
            let created = 0;
            await this.prisma.scrapingJob.update({
                where: { id: jobId },
                data: { totalUrls: urls.length },
            });
            for (const url of urls) {
                try {
                    const properties = await this.scrapeUrl(url, source);
                    totalFound += properties.length;
                    for (const prop of properties) {
                        try {
                            const listingUrl = prop.sourceUrl || url;
                            await this.upsertProperty(prop, source.name, listingUrl);
                            created++;
                        }
                        catch (err) {
                            this.logger.warn(`Failed to upsert property: ${err.message}`);
                        }
                    }
                    scraped++;
                }
                catch (err) {
                    failed++;
                    this.logger.warn(`Failed to scrape ${url}: ${err.message}`);
                }
                await this.prisma.scrapingJob.update({
                    where: { id: jobId },
                    data: { scrapedUrls: scraped, failedUrls: failed, propertiesFound: created },
                });
            }
            await this.prisma.scrapingJob.update({
                where: { id: jobId },
                data: { status: 'COMPLETED', completedAt: new Date() },
            });
            await this.notifyAdmins({
                title: 'Scraping Completed',
                message: `Scraping job for "${source.name}" completed. Found ${created} new properties.`,
                type: 'SCRAPING',
                link: '/admin/scraping',
            });
        }
        catch (err) {
            await this.prisma.scrapingJob.update({
                where: { id: jobId },
                data: { status: 'FAILED', error: err.message, completedAt: new Date() },
            });
            await this.notifyAdmins({
                title: 'Scraping Failed',
                message: `Scraping job for "${source.name}" failed: ${err.message}`,
                type: 'SCRAPING',
                link: '/admin/scraping',
            });
        }
    }
    async notifyAdmins(data) {
        try {
            const admins = await this.prisma.user.findMany({
                where: { role: 'SUPER_ADMIN', isActive: true },
                select: { id: true },
            });
            for (const admin of admins) {
                await this.notificationsService.create({ userId: admin.id, ...data });
            }
        }
        catch (err) {
            this.logger.warn(`Failed to notify admins: ${err.message}`);
        }
    }
    hash(str) {
        return crypto.createHash('md5').update(str).digest('hex');
    }
    async upsertProperty(data, sourceName, sourceUrl) {
        await this.ensureScrapingBot();
        const urlHash = this.hash(sourceUrl);
        const existing = await this.prisma.property.findUnique({ where: { sourceUrlHash: urlHash } });
        if (existing)
            return existing;
        return this.prisma.property.create({
            data: {
                title: data.title ?? 'Untitled',
                description: data.description,
                price: data.price ?? 0,
                surface: data.surface,
                rooms: data.rooms,
                bedrooms: data.bedrooms,
                bathrooms: data.bathrooms,
                propertyType: data.propertyType ?? 'APARTMENT',
                transactionType: data.transactionType ?? 'SALE',
                address: data.address,
                city: data.city,
                province: data.province,
                latitude: data.latitude,
                longitude: data.longitude,
                images: data.images ?? [],
                features: data.features ?? [],
                retailerId: data.retailerId ?? this.defaultRetailerId ?? 1,
                scrapedFrom: sourceName,
                sourceUrl,
                sourceUrlHash: urlHash,
            },
        });
    }
    async scrapeUrl(url, source) {
        if (source.usePuppeteer) {
            return this.scrapeWithPuppeteer(url, source.selectors, source);
        }
        return this.scrapeWithCheerio(url, source.selectors);
    }
    async scrapeWithCheerio(url, selectors) {
        const cheerio = await import('cheerio');
        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            });
            const html = await response.text();
            const $ = cheerio.load(html);
            return this.extractListings($, selectors);
        }
        catch (err) {
            this.logger.warn(`Cheerio scrape failed for ${url}: ${err.message}`);
            return [];
        }
    }
    async scrapeWithPuppeteer(url, selectors, source) {
        let browser = null;
        try {
            const puppeteer = await import('puppeteer');
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            const allResults = [];
            const maxPages = source?.nextPageSelector ? (source?.maxPages || 1) : 1;
            for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
                if (currentPage === 1) {
                    await page.goto(url, { waitUntil: 'load', timeout: 20000 }).catch(async () => {
                        this.logger.warn('Page load timeout, trying domcontentloaded...');
                        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => { });
                    });
                }
                else {
                    const nextBtn = await page.$(source.nextPageSelector).catch(() => null);
                    if (!nextBtn)
                        break;
                    await nextBtn.click().catch(() => null);
                }
                await page.evaluate(() => new Promise(r => setTimeout(r, 3000)));
                const pageResults = await page.evaluate((sel) => {
                    const ls = sel.listingSelector || '[class*=ad], [class*=listing], [class*=card], [class*=item], article, li[class]';
                    let items = document.querySelectorAll(ls);
                    if (items.length === 0) {
                        items = document.querySelectorAll('a[href*="property"], a[href*="listing"], a[href*="ad"], a[href*="item"], a[href*="detail"], a[href*="announce"], ' +
                            '[class*="property"]:not([class*="pagination"]):not([class*="page"]):not([class*="nav"]), ' +
                            '[class*="listing"]:not([class*="pagination"]):not([class*="page"]):not([class*="nav"]), ' +
                            '[class*="card"]:not([class*="pagination"]):not([class*="page"]):not([class*="nav"])');
                    }
                    const priceRegex = /(\d[\d\s.,]*)\s*(€|eur|usd|dt|tnd|dinar|\$|£)/i;
                    const surfaceRegex = /(\d+)\s*m[²2]/i;
                    const roomsRegex = /(\d+)\s*(bed|room|bedroom|br|pi[eè]ce)/i;
                    return Array.from(items).map(el => {
                        const text = el.innerText || '';
                        const link = el.querySelector('a');
                        const img = el.querySelector('img');
                        let title = '';
                        const hEl = el.querySelector('h2, h3, h4, [class*=title], [class*=name]');
                        if (hEl)
                            title = hEl.innerText.trim();
                        if (!title) {
                            const lines = text.split('\n').filter(l => l.trim() && l.trim().length > 5);
                            title = lines[0] || '';
                        }
                        if (!title && link)
                            title = link.innerText.trim();
                        if (/^(page|prev|next|last|first|previous|1\s*of|\d+\s*-\s*\d+)/i.test(title))
                            title = '';
                        let priceText = '';
                        const pEl = el.querySelector(sel.priceSelector || '[class*=price]');
                        if (pEl)
                            priceText = pEl.innerText.trim();
                        if (!priceText) {
                            const match = text.match(priceRegex);
                            if (match)
                                priceText = match[1];
                        }
                        if (!priceText) {
                            const match = text.match(/price[:\s]*(\d[\d\s.,]*)/i);
                            if (match)
                                priceText = match[1];
                        }
                        if (!priceText) {
                            const digits = text.match(/\b\d{3,}(?:[\s.,]\d{3})*(?:[\s.,]\d{2})?\b/);
                            if (digits)
                                priceText = digits[0];
                        }
                        let location = '';
                        const cEl = el.querySelector('[class*=location], [class*=city], [class*=place], [class*=region]');
                        if (cEl)
                            location = cEl.innerText.trim();
                        if (!location) {
                            const match = text.match(/(?:in|at|location|city|area|region|πόλη|τοποθεσία)\s*[:\s]+(\w+(?:[\s-]\w+)?)/i);
                            if (match && !/^\d+$/.test(match[1]) && match[1].length > 2)
                                location = match[1];
                        }
                        if (location.length > 30)
                            location = '';
                        let surface = '';
                        const sEl = el.querySelector('[class*=surface], [class*=area], [class*=size]');
                        if (sEl)
                            surface = sEl.innerText.trim();
                        if (!surface) {
                            const match = text.match(surfaceRegex);
                            if (match)
                                surface = match[1];
                        }
                        if (!surface) {
                            const match = text.match(/(\d+)\s*(m[èe]tre|metre|sq[.\s]?m|m²)/i);
                            if (match)
                                surface = match[1];
                        }
                        let rooms = '';
                        const rEl = el.querySelector('[class*=room], [class*=bed]');
                        if (rEl)
                            rooms = rEl.innerText.trim();
                        if (!rooms) {
                            const match = text.match(roomsRegex);
                            if (match)
                                rooms = match[1];
                        }
                        if (!rooms) {
                            const match = text.match(/\b(\d)\s*[-–]\s*(?:bed|room|bedroom)/i);
                            if (match)
                                rooms = match[1];
                        }
                        const imageUrls = Array.from(el.querySelectorAll('img'))
                            .map((im) => im.src)
                            .filter(src => src && !src.includes('data:') && !src.includes('base64'));
                        return {
                            title: title.slice(0, 200),
                            price: priceText,
                            description: text.slice(0, 500),
                            city: location,
                            surface,
                            rooms,
                            imageUrls,
                            url: link?.href || '',
                        };
                    }).filter(r => (r.title && r.title.length > 3) || r.price);
                }, selectors);
                allResults.push(...pageResults.map(r => ({
                    title: r.title || 'Untitled',
                    price: this.parsePrice(r.price),
                    description: r.description || '',
                    city: r.city || '',
                    surface: parseInt(r.surface) || undefined,
                    rooms: parseInt(r.rooms) || undefined,
                    images: (r.imageUrls || []).filter(Boolean),
                    sourceUrl: r.url,
                })));
            }
            return allResults;
        }
        catch (err) {
            this.logger.warn(`Puppeteer scrape failed for ${url}: ${err.message}`);
            return [];
        }
        finally {
            if (browser)
                await browser.close().catch(() => { });
        }
    }
    extractListings($, selectors) {
        const results = [];
        $(selectors.listingSelector || 'article, .listing, .ad').each((_, el) => {
            const $el = $(el);
            const images = [];
            $el.find(selectors.imageSelector || 'img').each((_, img) => {
                const src = $(img).attr('src');
                if (src && !src.includes('data:') && !src.includes('base64'))
                    images.push(src);
            });
            results.push({
                title: $el.find(selectors.titleSelector || 'h2, h3').text().trim(),
                price: this.parsePrice($el.find(selectors.priceSelector || '[class*=price]').text().trim()),
                description: $el.find(selectors.descSelector || 'p').text().trim(),
                city: $el.find(selectors.locationSelector || '[class*=location], [class*=city]').text().trim(),
                surface: parseInt($el.find(selectors.surfaceSelector || '[class*=surface], [class*=area]').text().trim()) || undefined,
                rooms: parseInt($el.find(selectors.roomsSelector || '[class*=room]').text().trim()) || undefined,
                images,
            });
        });
        return results;
    }
    async getResults(sourceName) {
        return this.prisma.property.findMany({
            where: { scrapedFrom: sourceName },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { favorites: true } },
            },
        });
    }
    parsePrice(text) {
        if (!text)
            return 0;
        let cleaned = text.replace(/[^0-9,. ]/g, '').trim();
        if (/,\d{2}$/.test(cleaned))
            cleaned = cleaned.replace(',', '.');
        cleaned = cleaned.replace(/[.,\s]/g, '');
        const parsed = parseInt(cleaned, 10);
        return isNaN(parsed) ? 0 : parsed;
    }
};
exports.ScrapingService = ScrapingService;
exports.ScrapingService = ScrapingService = ScrapingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ScrapingService);
//# sourceMappingURL=scraping.service.js.map