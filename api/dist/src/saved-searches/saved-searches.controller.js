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
exports.SavedSearchesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const saved_searches_service_1 = require("./saved-searches.service");
const create_saved_search_dto_1 = require("./dto/create-saved-search.dto");
const update_saved_search_dto_1 = require("./dto/update-saved-search.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let SavedSearchesController = class SavedSearchesController {
    savedSearchesService;
    constructor(savedSearchesService) {
        this.savedSearchesService = savedSearchesService;
    }
    findAll(userId) {
        return this.savedSearchesService.findAll(userId);
    }
    create(dto, userId) {
        return this.savedSearchesService.create(userId, dto);
    }
    update(id, dto, userId) {
        return this.savedSearchesService.update(id, userId, dto);
    }
    remove(id, userId) {
        return this.savedSearchesService.remove(id, userId);
    }
};
exports.SavedSearchesController = SavedSearchesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List my saved searches' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SavedSearchesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a saved search' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_saved_search_dto_1.CreateSavedSearchDto, Number]),
    __metadata("design:returntype", void 0)
], SavedSearchesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a saved search (owner)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_saved_search_dto_1.UpdateSavedSearchDto, Number]),
    __metadata("design:returntype", void 0)
], SavedSearchesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a saved search (owner)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SavedSearchesController.prototype, "remove", null);
exports.SavedSearchesController = SavedSearchesController = __decorate([
    (0, swagger_1.ApiTags)('Saved Searches'),
    (0, common_1.Controller)('saved-searches'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [saved_searches_service_1.SavedSearchesService])
], SavedSearchesController);
//# sourceMappingURL=saved-searches.controller.js.map