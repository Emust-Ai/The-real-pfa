import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { ParseSearchResponse } from './dto/parse-search.dto';
import { GenerateDescriptionDto, GenerateDescriptionResponse } from './dto/generate-description.dto';
import { EnrichScrapedResponse } from './dto/enrich-scraped.dto';

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private groq: Groq;
  private readonly model = 'llama-3.3-70b-versatile';

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY not set. AI features will return mock data.');
    } else {
      this.groq = new Groq({ apiKey });
    }
  }

  private async callGroq(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!this.groq) {
      this.logger.warn('Groq not initialized, returning empty response');
      return '';
    }

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: this.model,
        temperature: 0.3,
        max_tokens: 1024,
      });

      return completion.choices[0]?.message?.content?.trim() ?? '';
    } catch (error: any) {
      this.logger.error('Groq API error', error.message);
      throw new HttpException(
        `AI service error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async parseSearchQuery(query: string): Promise<ParseSearchResponse> {
    const systemPrompt = `You are a real estate search parser. Extract structured filters from natural language queries.
Return ONLY valid JSON with this exact shape:
{
  "filters": {
    "search": string | null,
    "propertyType": "APARTMENT" | "HOUSE" | "VILLA" | "LAND" | "COMMERCIAL" | "OFFICE" | "STUDIO" | "PENTHOUSE" | "DUPLEX" | null,
    "transactionType": "SALE" | "RENT" | null,
    "minPrice": number | null,
    "maxPrice": number | null,
    "rooms": number | null,
    "bedrooms": number | null,
    "city": string | null
  },
  "summary": string
}

Rules:
- prices: convert "k"/"mille" to thousands, "million" to millions. Use TND. "500k" = 500000.
- "under X" = maxPrice, "over X" = minPrice, "between X and Y" = both
- "cheap" = maxPrice 200000
- "luxury" = minPrice 500000
- "for sale" = transactionType SALE, "for rent" = RENT, "to buy" = SALE
- summary: short human-readable description of what was understood (max 60 chars)
- Set null for anything not mentioned
- Return ONLY the JSON, no markdown, no explanation.`;

    const raw = await this.callGroq(systemPrompt, query);

    if (!raw) {
      return { filters: { search: query }, summary: 'Basic search' };
    }

    try {
      const cleaned = raw.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleaned);
      const filters = Object.fromEntries(
        Object.entries(parsed.filters ?? {}).filter(([_, v]) => v !== null && v !== ''),
      );
      return { filters, summary: parsed.summary ?? 'AI parsed search' };
    } catch {
      return { filters: { search: query }, summary: 'Could not parse query, using plain text search' };
    }
  }

  async generateDescription(dto: GenerateDescriptionDto): Promise<GenerateDescriptionResponse> {
    const systemPrompt = `You are a real estate copywriter. Write compelling property descriptions in English.
Return ONLY valid JSON: { "description": string }
- 2-4 sentences max
- Highlight best features
- Sound professional and inviting
- Include location advantages if city given
- For RENT: emphasize lifestyle. For SALE: emphasize investment/value.`;

    const features = dto.features?.length ? `Features: ${dto.features.join(', ')}` : '';
    const location = dto.city ? `Location: ${dto.city}` : '';
    const size = dto.surface ? `Size: ${dto.surface}m²` : '';
    const rooms = dto.rooms ? `Rooms: ${dto.rooms}` : '';
    const bedrooms = dto.bedrooms ? `Bedrooms: ${dto.bedrooms}` : '';
    const price = dto.price ? `Price: ${dto.price.toLocaleString()} TND` : '';
    const txn = dto.transactionType === 'RENT' ? 'For Rent' : dto.transactionType === 'SALE' ? 'For Sale' : '';

    const userPrompt = [
      `Title: ${dto.title}`,
      `Type: ${dto.propertyType}`,
      txn,
      location,
      size,
      rooms,
      bedrooms,
      price,
      features,
    ].filter(Boolean).join('\n');

    const raw = await this.callGroq(systemPrompt, userPrompt);

    if (!raw) {
      return { description: dto.title ? `${dto.title} — a wonderful property available now.` : 'A wonderful property available now.' };
    }

    try {
      const cleaned = raw.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleaned);
      return { description: parsed.description };
    } catch {
      return { description: raw };
    }
  }

  async enrichScrapedData(rawText: string): Promise<EnrichScrapedResponse> {
    const systemPrompt = `You extract structured real estate listing data from raw HTML/text.
Return ONLY valid JSON with this exact shape:
{
  "data": {
    "title": string | null,
    "description": string | null,
    "price": number | null,
    "surface": number | null,
    "rooms": number | null,
    "bedrooms": number | null,
    "bathrooms": number | null,
    "propertyType": "APARTMENT" | "HOUSE" | "VILLA" | "LAND" | "COMMERCIAL" | "OFFICE" | "STUDIO" | "PENTHOUSE" | "DUPLEX" | null,
    "city": string | null,
    "features": string[] | null
  }
}

Rules:
- price: extract numeric value (ignore currency symbols). "500 000 DT" = 500000.
- surface: extract m² value as number
- propertyType: infer from context
- features: extract amenity-like items
- Set null for anything not found or unclear
- Return ONLY the JSON, no markdown.`;

    const truncated = rawText.slice(0, 4000);
    const raw = await this.callGroq(systemPrompt, truncated);

    if (!raw) {
      return { data: {} };
    }

    try {
      const cleaned = raw.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleaned);
      const data = Object.fromEntries(
        Object.entries(parsed.data ?? {}).filter(([_, v]) => v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)),
      );
      return { data };
    } catch {
      return { data: { description: raw } };
    }
  }
}
