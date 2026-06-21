import { SavedSearchesService } from './saved-searches.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';
export declare class SavedSearchesController {
    private readonly savedSearchesService;
    constructor(savedSearchesService: SavedSearchesService);
    findAll(userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: number;
        filters: import("@prisma/client/runtime/client").JsonValue;
        notifyInApp: boolean;
        notifyEmail: boolean;
        lastNotifiedAt: Date | null;
    }[]>;
    create(dto: CreateSavedSearchDto, userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: number;
        filters: import("@prisma/client/runtime/client").JsonValue;
        notifyInApp: boolean;
        notifyEmail: boolean;
        lastNotifiedAt: Date | null;
    }>;
    update(id: number, dto: UpdateSavedSearchDto, userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: number;
        filters: import("@prisma/client/runtime/client").JsonValue;
        notifyInApp: boolean;
        notifyEmail: boolean;
        lastNotifiedAt: Date | null;
    }>;
    remove(id: number, userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: number;
        filters: import("@prisma/client/runtime/client").JsonValue;
        notifyInApp: boolean;
        notifyEmail: boolean;
        lastNotifiedAt: Date | null;
    }>;
}
