import { PrismaService } from '../prisma/prisma.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';
export declare class SavedSearchesService {
    private prisma;
    constructor(prisma: PrismaService);
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
    create(userId: number, dto: CreateSavedSearchDto): Promise<{
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
    update(id: number, userId: number, dto: UpdateSavedSearchDto): Promise<{
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
    checkForNewProperties(jobId?: number): Promise<void>;
}
