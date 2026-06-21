import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as crypto from 'crypto';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);
  private defaultRetailerId: number | null = null;
  private botInitPromise: Promise<void> | null = null;

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private async ensureScrapingBot() {
    if (this.defaultRetailerId !== null) return;
    if (this.botInitPromise) return this.botInitPromise;
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
      } catch (err) {
        this.logger.warn(`Could not ensure scraping bot: ${err.message}, falling back to ID 1`);
        this.defaultRetailerId = 1;
      }
    })();
    return this.botInitPromise;
  }

  async getSources() {
    return this.prisma.scrapingSource.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createSource(data: { name: string; baseUrl: string; selectors: any; usePuppeteer?: boolean; maxPages?: number; pageUrlPattern?: string; nextPageSelector?: string }) {
    return this.prisma.scrapingSource.create({
      data: { name: data.name, baseUrl: data.baseUrl, selectors: data.selectors, usePuppeteer: data.usePuppeteer ?? false, maxPages: data.maxPages ?? 1, pageUrlPattern: data.pageUrlPattern, nextPageSelector: data.nextPageSelector },
    });
  }

  async updateSource(id: number, data: { name?: string; baseUrl?: string; selectors?: any; isActive?: boolean; usePuppeteer?: boolean; maxPages?: number; pageUrlPattern?: string; nextPageSelector?: string }) {
    return this.prisma.scrapingSource.update({
      where: { id },
      data: { ...data, selectors: data.selectors ?? undefined },
    });
  }

  async deleteSource(id: number) {
    await this.prisma.scrapingSource.delete({ where: { id } });
  }

  async getJobs(sourceId?: number) {
    const where = sourceId ? { sourceId } : {};
    return this.prisma.scrapingJob.findMany({
      where,
      include: { source: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async startJob(sourceId: number) {
    const source = await this.prisma.scrapingSource.findUnique({ where: { id: sourceId } });
    if (!source) throw new Error('Source not found');

    const job = await this.prisma.scrapingJob.create({
      data: { sourceId, status: 'PENDING' },
    });

    this.runJob(job.id, source).catch((err) => {
      this.logger.error(`Job ${job.id} failed: ${err.message}`);
    });

    return job;
  }

  private async runJob(jobId: number, source: any) {
    await this.prisma.scrapingJob.update({
      where: { id: jobId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    try {
      let urls: string[] = [source.baseUrl];

      if (source.maxPages > 1) {
        if (source.pageUrlPattern) {
          urls = [];
          for (let p = 1; p <= source.maxPages; p++) {
            urls.push(source.baseUrl + source.pageUrlPattern.replace('{page}', String(p)));
          }
        } else if (source.nextPageSelector) {
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
            } catch (err) {
              this.logger.warn(`Failed to upsert property: ${err.message}`);
            }
          }
          scraped++;
        } catch (err) {
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
    } catch (err) {
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

  private async notifyAdmins(data: { title: string; message: string; type: string; link?: string }) {
    try {
      const admins = await this.prisma.user.findMany({
        where: { role: 'SUPER_ADMIN', isActive: true },
        select: { id: true },
      });
      for (const admin of admins) {
        await this.notificationsService.create({ userId: admin.id, ...data });
      }
    } catch (err) {
      this.logger.warn(`Failed to notify admins: ${err.message}`);
    }
  }

  private hash(str: string) {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  private async upsertProperty(data: any, sourceName: string, sourceUrl: string) {
    await this.ensureScrapingBot();
    const urlHash = this.hash(sourceUrl);
    const existing = await this.prisma.property.findUnique({ where: { sourceUrlHash: urlHash } });
    if (existing) return existing;

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

  private async scrapeUrl(url: string, source: any): Promise<any[]> {
    if (source.usePuppeteer) {
      return this.scrapeWithPuppeteer(url, source.selectors, source);
    }
    return this.scrapeWithCheerio(url, source.selectors);
  }

  private async scrapeWithCheerio(url: string, selectors: any): Promise<any[]> {
    const cheerio = await import('cheerio');
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      return this.extractListings($, selectors);
    } catch (err) {
      this.logger.warn(`Cheerio scrape failed for ${url}: ${err.message}`);
      return [];
    }
  }

  private async scrapeWithPuppeteer(url: string, selectors: any, source?: any): Promise<any[]> {
    let browser: any = null;
    try {
      const puppeteer = await import('puppeteer');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

      const allResults: any[] = [];
      const maxPages = source?.nextPageSelector ? (source?.maxPages || 1) : 1;

      for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
        if (currentPage === 1) {
          await page.goto(url, { waitUntil: 'load', timeout: 20000 }).catch(async () => {
            this.logger.warn('Page load timeout, trying domcontentloaded...');
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
          });
        } else {
          const nextBtn = await page.$(source.nextPageSelector).catch(() => null);
          if (!nextBtn) break;
          await nextBtn.click().catch(() => null);
        }

        await page.evaluate(() => new Promise<void>(r => setTimeout(r, 3000)));

        const pageResults = await page.evaluate((sel: any) => {
          const ls = sel.listingSelector || '[class*=ad], [class*=listing], [class*=card], [class*=item], article, li[class]';
          let items = document.querySelectorAll(ls);

          if (items.length === 0) {
            items = document.querySelectorAll(
              'a[href*="property"], a[href*="listing"], a[href*="ad"], a[href*="item"], a[href*="detail"], a[href*="announce"], ' +
              '[class*="property"]:not([class*="pagination"]):not([class*="page"]):not([class*="nav"]), ' +
              '[class*="listing"]:not([class*="pagination"]):not([class*="page"]):not([class*="nav"]), ' +
              '[class*="card"]:not([class*="pagination"]):not([class*="page"]):not([class*="nav"])'
            );
          }

          const priceRegex = /(\d[\d\s.,]*)\s*(€|eur|usd|dt|tnd|dinar|\$|£)/i;
          const surfaceRegex = /(\d+)\s*m[²2]/i;
          const roomsRegex = /(\d+)\s*(bed|room|bedroom|br|pi[eè]ce)/i;

          return Array.from(items).map(el => {
            const text = (el as HTMLElement).innerText || '';
            const link = el.querySelector('a') as HTMLAnchorElement;
            const img = el.querySelector('img') as HTMLImageElement;

            let title = '';
            const hEl = el.querySelector('h2, h3, h4, [class*=title], [class*=name]');
            if (hEl) title = (hEl as HTMLElement).innerText.trim();
            if (!title) {
              const lines = text.split('\n').filter(l => l.trim() && l.trim().length > 5);
              title = lines[0] || '';
            }
            if (!title && link) title = (link as HTMLElement).innerText.trim();
            if (/^(page|prev|next|last|first|previous|1\s*of|\d+\s*-\s*\d+)/i.test(title)) title = '';

            let priceText = '';
            const pEl = el.querySelector(sel.priceSelector || '[class*=price]');
            if (pEl) priceText = (pEl as HTMLElement).innerText.trim();
            if (!priceText) {
              const match = text.match(priceRegex);
              if (match) priceText = match[1];
            }
            if (!priceText) {
              const match = text.match(/price[:\s]*(\d[\d\s.,]*)/i);
              if (match) priceText = match[1];
            }
            if (!priceText) {
              const digits = text.match(/\b\d{3,}(?:[\s.,]\d{3})*(?:[\s.,]\d{2})?\b/);
              if (digits) priceText = digits[0];
            }

            let location = '';
            const cEl = el.querySelector('[class*=location], [class*=city], [class*=place], [class*=region]');
            if (cEl) location = (cEl as HTMLElement).innerText.trim();
            if (!location) {
              const match = text.match(/(?:in|at|location|city|area|region|πόλη|τοποθεσία)\s*[:\s]+(\w+(?:[\s-]\w+)?)/i);
              if (match && !/^\d+$/.test(match[1]) && match[1].length > 2) location = match[1];
            }
            if (location.length > 30) location = '';

            let surface = '';
            const sEl = el.querySelector('[class*=surface], [class*=area], [class*=size]');
            if (sEl) surface = (sEl as HTMLElement).innerText.trim();
            if (!surface) {
              const match = text.match(surfaceRegex);
              if (match) surface = match[1];
            }
            if (!surface) {
              const match = text.match(/(\d+)\s*(m[èe]tre|metre|sq[.\s]?m|m²)/i);
              if (match) surface = match[1];
            }

            let rooms = '';
            const rEl = el.querySelector('[class*=room], [class*=bed]');
            if (rEl) rooms = (rEl as HTMLElement).innerText.trim();
            if (!rooms) {
              const match = text.match(roomsRegex);
              if (match) rooms = match[1];
            }
            if (!rooms) {
              const match = text.match(/\b(\d)\s*[-–]\s*(?:bed|room|bedroom)/i);
              if (match) rooms = match[1];
            }

            const imageUrls = Array.from(el.querySelectorAll('img'))
              .map((im: HTMLImageElement) => im.src)
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
    } catch (err) {
      this.logger.warn(`Puppeteer scrape failed for ${url}: ${err.message}`);
      return [];
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }

  private extractListings($: any, selectors: any): any[] {
    const results: any[] = [];
    $(selectors.listingSelector || 'article, .listing, .ad').each((_: any, el: any) => {
      const $el = $(el);
      const images: string[] = [];
      $el.find(selectors.imageSelector || 'img').each((_: any, img: any) => {
        const src = $(img).attr('src');
        if (src && !src.includes('data:') && !src.includes('base64')) images.push(src);
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

  async getResults(sourceName: string) {
    return this.prisma.property.findMany({
      where: { scrapedFrom: sourceName },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { favorites: true } },
      },
    });
  }

  private parsePrice(text: string): number {
    if (!text) return 0;
    let cleaned = text.replace(/[^0-9,. ]/g, '').trim();
    if (/,\d{2}$/.test(cleaned)) cleaned = cleaned.replace(',', '.');
    cleaned = cleaned.replace(/[.,\s]/g, '');
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
}
