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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const scraping_service_1 = require("./scraping.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let ScrapingController = class ScrapingController {
    scrapingService;
    constructor(scrapingService) {
        this.scrapingService = scrapingService;
    }
    getSources() {
        return this.scrapingService.getSources();
    }
    createSource(body) {
        return this.scrapingService.createSource(body);
    }
    updateSource(id, body) {
        return this.scrapingService.updateSource(id, body);
    }
    deleteSource(id) {
        return this.scrapingService.deleteSource(id);
    }
    getJobs(sourceId) {
        return this.scrapingService.getJobs(sourceId ? parseInt(sourceId) : undefined);
    }
    startJob(sourceId) {
        return this.scrapingService.startJob(sourceId);
    }
    getResults(sourceName) {
        return this.scrapingService.getResults(sourceName);
    }
};
exports.ScrapingController = ScrapingController;
__decorate([
    (0, common_1.Get)('sources'),
    (0, swagger_1.ApiOperation)({ summary: 'List all scraping sources' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ScrapingController.prototype, "getSources", null);
__decorate([
    (0, common_1.Post)('sources'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a scraping source' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ScrapingController.prototype, "createSource", null);
__decorate([
    (0, common_1.Patch)('sources/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a scraping source' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ScrapingController.prototype, "updateSource", null);
__decorate([
    (0, common_1.Delete)('sources/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a scraping source' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ScrapingController.prototype, "deleteSource", null);
__decorate([
    (0, common_1.Get)('jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'List scraping jobs' }),
    __param(0, (0, common_1.Query)('sourceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScrapingController.prototype, "getJobs", null);
__decorate([
    (0, common_1.Post)('jobs/:sourceId/start'),
    (0, swagger_1.ApiOperation)({ summary: 'Start a scraping job for a source' }),
    __param(0, (0, common_1.Param)('sourceId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ScrapingController.prototype, "startJob", null);
__decorate([
    (0, common_1.Get)('results/:sourceName'),
    (0, swagger_1.ApiOperation)({ summary: 'Get properties scraped from a source' }),
    __param(0, (0, common_1.Param)('sourceName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScrapingController.prototype, "getResults", null);
exports.ScrapingController = ScrapingController = __decorate([
    (0, swagger_1.ApiTags)('Scraping'),
    (0, common_1.Controller)('scraping'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [scraping_service_1.ScrapingService])
], ScrapingController);
//# sourceMappingURL=scraping.controller.js.map