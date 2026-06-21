"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSavedSearchDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_saved_search_dto_1 = require("./create-saved-search.dto");
class UpdateSavedSearchDto extends (0, swagger_1.PartialType)(create_saved_search_dto_1.CreateSavedSearchDto) {
}
exports.UpdateSavedSearchDto = UpdateSavedSearchDto;
//# sourceMappingURL=update-saved-search.dto.js.map