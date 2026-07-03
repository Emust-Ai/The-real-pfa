import { PrismaService } from '../prisma/prisma.service';
export declare class FavoritesService {
    private prisma;
    constructor(prisma: PrismaService);
    add(userId: number, propertyId: number): Promise<any>;
    remove(userId: number, propertyId: number): Promise<void>;
    findAll(userId: number): Promise<any>;
}
