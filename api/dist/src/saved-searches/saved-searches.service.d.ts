import { PrismaService } from '../prisma/prisma.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';
export declare class SavedSearchesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: number): Promise<any>;
    create(userId: number, dto: CreateSavedSearchDto): Promise<any>;
    update(id: number, userId: number, dto: UpdateSavedSearchDto): Promise<any>;
    remove(id: number, userId: number): Promise<any>;
    checkForNewProperties(jobId?: number): Promise<void>;
}
