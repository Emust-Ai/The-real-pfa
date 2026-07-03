import { SavedSearchesService } from './saved-searches.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';
export declare class SavedSearchesController {
    private readonly savedSearchesService;
    constructor(savedSearchesService: SavedSearchesService);
    findAll(userId: number): Promise<any>;
    create(dto: CreateSavedSearchDto, userId: number): Promise<any>;
    update(id: number, dto: UpdateSavedSearchDto, userId: number): Promise<any>;
    remove(id: number, userId: number): Promise<any>;
}
