import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';

@Injectable()
export class SavedSearchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: number, dto: CreateSavedSearchDto) {
    return this.prisma.savedSearch.create({
      data: {
        name: dto.name,
        filters: dto.filters,
        notifyInApp: dto.notifyInApp ?? true,
        notifyEmail: dto.notifyEmail ?? false,
        userId,
      },
    });
  }

  async update(id: number, userId: number, dto: UpdateSavedSearchDto) {
    const savedSearch = await this.prisma.savedSearch.findUnique({ where: { id } });
    if (!savedSearch) throw new NotFoundException('Saved search not found');
    if (savedSearch.userId !== userId) throw new ForbiddenException('Not your saved search');

    return this.prisma.savedSearch.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.filters !== undefined && { filters: dto.filters }),
        ...(dto.notifyInApp !== undefined && { notifyInApp: dto.notifyInApp }),
        ...(dto.notifyEmail !== undefined && { notifyEmail: dto.notifyEmail }),
      },
    });
  }

  async remove(id: number, userId: number) {
    const savedSearch = await this.prisma.savedSearch.findUnique({ where: { id } });
    if (!savedSearch) throw new NotFoundException('Saved search not found');
    if (savedSearch.userId !== userId) throw new ForbiddenException('Not your saved search');

    return this.prisma.savedSearch.delete({ where: { id } });
  }

  async checkForNewProperties(jobId?: number) {
    const savedSearches = await this.prisma.savedSearch.findMany({
      where: { notifyInApp: true },
    });

    for (const search of savedSearches) {
      const filters = search.filters as Record<string, any>;
      const where: any = {};

      if (filters.propertyType) {
        where.propertyType = filters.propertyType;
      }
      if (filters.transactionType) {
        where.transactionType = filters.transactionType;
      }
      if (filters.city) {
        where.city = { contains: filters.city, mode: 'insensitive' };
      }
      if (filters.minPrice) {
        where.price = { ...where.price, gte: Number(filters.minPrice) };
      }
      if (filters.maxPrice) {
        where.price = { ...where.price, lte: Number(filters.maxPrice) };
      }
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { city: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (search.lastNotifiedAt) {
        where.createdAt = { gt: search.lastNotifiedAt };
      }

      const count = await this.prisma.property.count({ where });

      if (count > 0) {
        await this.prisma.notification.create({
          data: {
            userId: search.userId,
            title: `New properties matching "${search.name}"`,
            message: `${count} new ${count === 1 ? 'property' : 'properties'} found matching your saved search.`,
            type: 'SAVED_SEARCH',
            link: '/properties',
          },
        });

        await this.prisma.savedSearch.update({
          where: { id: search.id },
          data: { lastNotifiedAt: new Date() },
        });
      }
    }
  }
}
