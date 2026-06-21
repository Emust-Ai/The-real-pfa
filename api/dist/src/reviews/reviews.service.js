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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByProperty(propertyId) {
        return this.prisma.review.findMany({
            where: { propertyId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(userId, propertyId, data) {
        const property = await this.prisma.property.findUnique({ where: { id: propertyId } });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        if (property.retailerId === userId)
            throw new common_1.ForbiddenException('Cannot review your own property');
        const existing = await this.prisma.review.findUnique({
            where: { userId_propertyId: { userId, propertyId } },
        });
        if (existing)
            throw new common_1.ConflictException('You have already reviewed this property');
        return this.prisma.review.create({
            data: { userId, propertyId, rating: data.rating, comment: data.comment },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            },
        });
    }
    async remove(userId, reviewId, userRole) {
        const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        if (review.userId !== userId && userRole !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Not allowed to delete this review');
        }
        return this.prisma.review.delete({ where: { id: reviewId } });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map