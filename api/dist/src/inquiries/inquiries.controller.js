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
exports.InquiriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inquiries_service_1 = require("./inquiries.service");
const create_inquiry_dto_1 = require("./dto/create-inquiry.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let InquiriesController = class InquiriesController {
    inquiriesService;
    constructor(inquiriesService) {
        this.inquiriesService = inquiriesService;
    }
    findAll(user) {
        return this.inquiriesService.findAll(user.id, user.role);
    }
    create(dto, userId, propertyId) {
        return this.inquiriesService.create(dto, userId, propertyId);
    }
};
exports.InquiriesController = InquiriesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List inquiries (admin: all, retailer: about my properties, client: my inquiries)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InquiriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':propertyId'),
    (0, swagger_1.ApiOperation)({ summary: 'Send an inquiry about a property' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('propertyId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_inquiry_dto_1.CreateInquiryDto, Number, Number]),
    __metadata("design:returntype", void 0)
], InquiriesController.prototype, "create", null);
exports.InquiriesController = InquiriesController = __decorate([
    (0, swagger_1.ApiTags)('Inquiries'),
    (0, common_1.Controller)('inquiries'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [inquiries_service_1.InquiriesService])
], InquiriesController);
//# sourceMappingURL=inquiries.controller.js.map