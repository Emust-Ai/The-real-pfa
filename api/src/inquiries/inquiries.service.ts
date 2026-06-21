import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class InquiriesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateInquiryDto, userId: number, propertyId: number) {
    const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    const inquiry = await this.prisma.inquiry.create({
      data: {
        message: dto.message,
        userId,
        propertyId,
      },
      include: {
        property: { select: { id: true, title: true } },
      },
    });

    if (property.retailerId !== userId) {
      await this.notificationsService.create({
        userId: property.retailerId,
        title: 'New Inquiry',
        message: `Someone inquired about "${property.title}"`,
        type: 'INQUIRY',
        link: `/properties/${propertyId}`,
      });
    }

    return inquiry;
  }

  async findAll(userId: number, userRole: string) {
    if (userRole === 'SUPER_ADMIN') {
      return this.prisma.inquiry.findMany({
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          property: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (userRole === 'RETAILER') {
      return this.prisma.inquiry.findMany({
        where: { property: { retailerId: userId } },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          property: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.inquiry.findMany({
      where: { userId },
      include: {
        property: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
