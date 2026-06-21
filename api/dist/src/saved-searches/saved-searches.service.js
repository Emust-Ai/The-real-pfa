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
exports.SavedSearchesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SavedSearchesService = class SavedSearchesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        return this.prisma.savedSearch.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(userId, dto) {
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
    async update(id, userId, dto) {
        const savedSearch = await this.prisma.savedSearch.findUnique({ where: { id } });
        if (!savedSearch)
            throw new common_1.NotFoundException('Saved search not found');
        if (savedSearch.userId !== userId)
            throw new common_1.ForbiddenException('Not your saved search');
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
    async remove(id, userId) {
        const savedSearch = await this.prisma.savedSearch.findUnique({ where: { id } });
        if (!savedSearch)
            throw new common_1.NotFoundException('Saved search not found');
        if (savedSearch.userId !== userId)
            throw new common_1.ForbiddenException('Not your saved search');
        return this.prisma.savedSearch.delete({ where: { id } });
    }
    async checkForNewProperties(jobId) {
        const savedSearches = await this.prisma.savedSearch.findMany({
            where: { notifyInApp: true },
        });
        for (const search of savedSearches) {
            const filters = search.filters;
            const where = {};
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
};
exports.SavedSearchesService = SavedSearchesService;
exports.SavedSearchesService = SavedSearchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SavedSearchesService);
//# sourceMappingURL=saved-searches.service.js.map