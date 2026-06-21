"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const [totalUsers, usersByRole, totalProperties, propertiesByType, propertiesByStatus, propertiesByTransaction, totalInquiries, recentJobs, weeklyProperties, avgPrice,] = await Promise.all([
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
    async cleanupTestData() {
        const result = await this.prisma.property.deleteMany({
            where: { scrapedFrom: 'realestateonline.gr' },
        });
        return { deleted: result.count, message: `Deleted ${result.count} test properties` };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map