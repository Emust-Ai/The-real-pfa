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
exports.InquiriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let InquiriesService = class InquiriesService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(dto, userId, propertyId) {
        const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
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
    async findAll(userId, userRole) {
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
};
exports.InquiriesService = InquiriesService;
exports.InquiriesService = InquiriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], InquiriesService);
//# sourceMappingURL=inquiries.service.js.map