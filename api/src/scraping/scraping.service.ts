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

  async createSource(data: { name: string; baseUrl: string; selectors: any; usePuppeteer?: boolean }) {
    return this.prisma.scrapingSource.create({
      data: { name: data.name, baseUrl: data.baseUrl, selectors: data.selectors, usePuppeteer: data.usePuppeteer ?? false },
    });
  }

  async updateSource(id: number, data: { name?: string; baseUrl?: string; selectors?: any; isActive?: boolean; usePuppeteer?: boolean }) {
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
      const urls = [source.baseUrl];
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
      return this.scrapeWithPuppeteer(url, source.selectors);
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

  private async scrapeWithPuppeteer(url: string, selectors: any): Promise<any[]> {
    let browser: any = null;
    try {
      const puppeteer = await import('puppeteer');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      const listingSelector = selectors.listingSelector || '[class*=ad], [class*=listing], [class*=card], [class*=item], article, li[class]';
      await page.waitForSelector(listingSelector, { timeout: 10000 }).catch(() => {});

      const results = await page.evaluate((sel: any) => {
        const ls = sel.listingSelector || '[class*=ad], [class*=listing], [class*=card], [class*=item], article, li[class]';
        const items = document.querySelectorAll(ls);
        const cities = ['tunis', 'sousse', 'sfax', 'nabeul', 'bizerte', 'gabes', 'kairouan', 'monastir', 'ariana', 'ben arous', 'manouba', 'mahdia', 'kasserine', 'nadhour', 'megrine', 'la ?marsa', 'carthage', 'sidi bou ?said', 'hammamet', 'gammarth', 'ennasr', 'charguia', 'mourouj', 'mnihla', 'raoued', 'kalâa kebira', 'jemmal', 'msaken', 'akouda', 'chott', 'meriem', 'bouficha', 'hammam ?sousse', 'sakiet', 'ezzit', 'ketena', 'sfax', 'gremda', 'thyna', 'kerkennah', 'mahrès', 'agareb', 'bir ali', 'hencha', 'sidi ?bouzid', 'kairouan', 'nasrallah', 'haffouz', 'oueslatia', 'bouhajla', 'chebika', 'fériana', 'tébessa'];
        const cityPattern = new RegExp('\\b(' + cities.join('|') + ')\\b', 'i');

        return Array.from(items).map(el => {
          const text = (el as HTMLElement).innerText || '';
          const html = el.innerHTML;
          const link = el.querySelector('a') as HTMLAnchorElement;
          const img = el.querySelector('img') as HTMLImageElement;

          let title = '';
          const hEl = el.querySelector(sel.titleSelector || 'h2, h3, [class*=title], [class*=name]');
          if (hEl) title = (hEl as HTMLElement).innerText.trim();
          if (!title) {
            const maybeTitle = text.split('\n').filter(l => l.trim() && l.trim().length > 5);
            title = maybeTitle[0] || '';
          }

          let priceText = '';
          const pEl = el.querySelector(sel.priceSelector || '[class*=price]');
          if (pEl) priceText = (pEl as HTMLElement).innerText.trim();
          if (!priceText) {
            const match = text.match(/(\d[\d\s.]*)\s*(dt|tnd|dinar|€)/i);
            if (match) priceText = match[1];
          }
          if (!priceText) {
            const match = text.match(/price[:\s]*(\d[\d\s.,]*)/i);
            if (match) priceText = match[1];
          }

          let city = '';
          const cEl = el.querySelector(sel.locationSelector || '[class*=location], [class*=city], [class*=place]');
          if (cEl) city = (cEl as HTMLElement).innerText.trim();
          if (!city) {
            const match = text.match(cityPattern);
            if (match) city = match[0];
          }
          if (!city) {
            const match = text.match(/[Àà]\s*('?"?)(\w+(?:\s+\w+)?)\1/i);
            if (match) city = match[2];
          }
          if (!city) {
            const match = text.match(/(?:à|location|ville|région)\s*[:\s]+(\w+(?:[\s-]\w+)?)/i);
            if (match && !/^\d+$/.test(match[1]) && match[1].length > 2) city = match[1];
          }

          let surface = '';
          const sEl = el.querySelector(sel.surfaceSelector || '[class*=surface], [class*=area], [class*=size]');
          if (sEl) surface = (sEl as HTMLElement).innerText.trim();
          if (!surface) {
            const match = text.match(/(\d+)\s*m[²2]/i);
            if (match) surface = match[1];
          }
          if (!surface) {
            const match = text.match(/(\d+)\s*(m[èe]tre|metre)/i);
            if (match) surface = match[1];
          }
          if (!surface) {
            const match = text.match(/surface[:\s]*(\d+)/i);
            if (match) surface = match[1];
          }

          let rooms = '';
          const rEl = el.querySelector(sel.roomsSelector || '[class*=room]');
          if (rEl) rooms = (rEl as HTMLElement).innerText.trim();
          if (!rooms) {
            const match = text.match(/S\s*\+\s*(\d+)/i);
            if (match) rooms = (parseInt(match[1], 10) + 1).toString();
          }
          if (!rooms) {
            const match = text.match(/(\d+)\s*pi[eè]ces?/i);
            if (match) rooms = match[1];
          }
          if (!rooms) {
            const match = text.match(/(\d+)\s*rooms?/i);
            if (match) rooms = match[1];
          }

          let imageUrl = '';
          if (img && img.src && !img.src.includes('data:')) imageUrl = img.src;

          return {
            title: title.slice(0, 200),
            price: priceText,
            description: text.slice(0, 500),
            city,
            surface,
            rooms,
            imageUrl,
            url: link?.href || '',
          };
        }).filter(r => r.title || r.price);
      }, selectors);

      return results.map(r => ({
        title: r.title || 'Untitled',
        price: this.parsePrice(r.price),
        description: r.description || '',
        city: r.city || '',
        surface: parseInt(r.surface) || undefined,
        rooms: parseInt(r.rooms) || undefined,
        images: r.imageUrl ? [r.imageUrl] : [],
        sourceUrl: r.url,
      }));
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
      results.push({
        title: $el.find(selectors.titleSelector || 'h2, h3').text().trim(),
        price: this.parsePrice($el.find(selectors.priceSelector || '[class*=price]').text().trim()),
        description: $el.find(selectors.descSelector || 'p').text().trim(),
        city: $el.find(selectors.locationSelector || '[class*=location], [class*=city]').text().trim(),
        surface: parseInt($el.find(selectors.surfaceSelector || '[class*=surface], [class*=area]').text().trim()) || undefined,
        rooms: parseInt($el.find(selectors.roomsSelector || '[class*=room]').text().trim()) || undefined,
        imageUrl: $el.find(selectors.imageSelector || 'img').first().attr('src'),
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
