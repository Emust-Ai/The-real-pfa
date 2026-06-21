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
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PropertiesService = class PropertiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, retailerId) {
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
    async findAll(query) {
        const where = {};
        const { search, propertyType, transactionType, status, city, province, scrapedFrom, minPrice, maxPrice, minSurface, maxSurface, rooms, bedrooms, page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
                { province: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (propertyType)
            where.propertyType = propertyType;
        if (transactionType)
            where.transactionType = transactionType;
        if (status)
            where.status = status;
        if (city)
            where.city = { contains: city, mode: 'insensitive' };
        if (province)
            where.province = { contains: province, mode: 'insensitive' };
        if (scrapedFrom)
            where.scrapedFrom = scrapedFrom;
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined)
                where.price.gte = minPrice;
            if (maxPrice !== undefined)
                where.price.lte = maxPrice;
        }
        if (minSurface !== undefined || maxSurface !== undefined) {
            where.surface = {};
            if (minSurface !== undefined)
                where.surface.gte = minSurface;
            if (maxSurface !== undefined)
                where.surface.lte = maxSurface;
        }
        if (rooms !== undefined)
            where.rooms = rooms;
        if (bedrooms !== undefined)
            where.bedrooms = bedrooms;
        const orderBy = {};
        const validSortFields = ['price', 'surface', 'rooms', 'bedrooms', 'createdAt', 'updatedAt'];
        const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        orderBy[field] = sortOrder;
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
    async findOne(id) {
        const property = await this.prisma.property.findUnique({
            where: { id },
            include: {
                retailer: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true },
                },
                _count: { select: { favorites: true, inquiries: true } },
            },
        });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        return property;
    }
    async update(id, dto, userId, userRole) {
        const property = await this.findOne(id);
        if (property.retailerId !== userId && userRole !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('You can only update your own properties');
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
    async remove(id, userId, userRole) {
        const property = await this.findOne(id);
        if (property.retailerId !== userId && userRole !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('You can only delete your own properties');
        }
        await this.prisma.property.delete({ where: { id } });
    }
    async findMyProperties(userId) {
        return this.prisma.property.findMany({
            where: { retailerId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { favorites: true, inquiries: true } },
            },
        });
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map