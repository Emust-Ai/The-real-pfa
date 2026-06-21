import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async add(userId: number, propertyId: number) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });
    if (existing) throw new ConflictException('Already in favorites');

    return this.prisma.favorite.create({
      data: { userId, propertyId },
      include: { property: true },
    });
  }

  async remove(userId: number, propertyId: number) {
    const fav = await this.prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });
    if (!fav) throw new NotFoundException('Favorite not found');

    await this.prisma.favorite.delete({
      where: { userId_propertyId: { userId, propertyId } },
    });
  }

  async findAll(userId: number) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        property: {
          include: {
            retailer: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
