import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findByProperty(propertyId: number) {
    return this.prisma.review.findMany({
      where: { propertyId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: number, propertyId: number, data: { rating: number; comment?: string }) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');
    if (property.retailerId === userId) throw new ForbiddenException('Cannot review your own property');

    const existing = await this.prisma.review.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });
    if (existing) throw new ConflictException('You have already reviewed this property');

    return this.prisma.review.create({
      data: { userId, propertyId, rating: data.rating, comment: data.comment },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });
  }

  async remove(userId: number, reviewId: number, userRole: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId && userRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Not allowed to delete this review');
    }
    return this.prisma.review.delete({ where: { id: reviewId } });
  }
}
