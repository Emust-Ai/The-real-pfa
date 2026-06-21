import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      usersByRole,
      totalProperties,
      propertiesByType,
      propertiesByStatus,
      propertiesByTransaction,
      totalInquiries,
      recentJobs,
      weeklyProperties,
      avgPrice,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({ by: ['role'], _count: true }),
      this.prisma.property.count(),
      this.prisma.property.groupBy({ by: ['propertyType'], _count: true }),
      this.prisma.property.groupBy({ by: ['status'], _count: true }),
      this.prisma.property.groupBy({ by: ['transactionType'], _count: true }),
      this.prisma.inquiry.count(),
      this.prisma.scrapingJob.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { source: { select: { name: true } } },
      }),
      this.prisma.property.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } },
      }),
      this.prisma.property.aggregate({ _avg: { price: true } }),
    ]);

    return {
      users: { total: totalUsers, byRole: usersByRole },
      properties: {
        total: totalProperties,
        byType: propertiesByType,
        byStatus: propertiesByStatus,
        byTransaction: propertiesByTransaction,
        weeklyNew: weeklyProperties,
        avgPrice: avgPrice._avg.price,
      },
      inquiries: { total: totalInquiries },
      recentJobs,
    };
  }
}
