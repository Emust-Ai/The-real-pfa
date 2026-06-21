import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePropertyDto, retailerId: number) {
    return this.prisma.property.create({
      data: {
        ...dto,
        price: dto.price,
        retailerId,
      },
      include: {
        retailer: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });
  }

  async findAll(query: QueryPropertyDto) {
    const where: Prisma.PropertyWhereInput = {};
    const { propertyType, transactionType, status, city, province, scrapedFrom, minPrice, maxPrice, minSurface, maxSurface, rooms, bedrooms, page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    if (propertyType) where.propertyType = propertyType;
    if (transactionType) where.transactionType = transactionType;
    if (status) where.status = status;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (province) where.province = { contains: province, mode: 'insensitive' };
    if (scrapedFrom) where.scrapedFrom = scrapedFrom;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }
    if (minSurface !== undefined || maxSurface !== undefined) {
      where.surface = {};
      if (minSurface !== undefined) where.surface.gte = minSurface;
      if (maxSurface !== undefined) where.surface.lte = maxSurface;
    }
    if (rooms !== undefined) where.rooms = rooms;
    if (bedrooms !== undefined) where.bedrooms = bedrooms;

    const orderBy: Prisma.PropertyOrderByWithRelationInput = {};
    const validSortFields = ['price', 'surface', 'rooms', 'bedrooms', 'createdAt', 'updatedAt'];
    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    orderBy[field as keyof Prisma.PropertyOrderByWithRelationInput] = sortOrder;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          retailer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          _count: { select: { favorites: true } },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        retailer: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
        _count: { select: { favorites: true, inquiries: true } },
      },
    });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  async update(id: number, dto: UpdatePropertyDto, userId: number, userRole: string) {
    const property = await this.findOne(id);
    if (property.retailerId !== userId && userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('You can only update your own properties');
    }
    return this.prisma.property.update({
      where: { id },
      data: {
        ...dto,
        price: dto.price !== undefined ? dto.price : undefined,
      },
      include: {
        retailer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async remove(id: number, userId: number, userRole: string) {
    const property = await this.findOne(id);
    if (property.retailerId !== userId && userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('You can only delete your own properties');
    }
    await this.prisma.property.delete({ where: { id } });
  }

  async findMyProperties(userId: number) {
    return this.prisma.property.findMany({
      where: { retailerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { favorites: true, inquiries: true } },
      },
    });
  }
}
