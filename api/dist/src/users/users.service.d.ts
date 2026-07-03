import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    updateRole(id: number, role: Role): Promise<any>;
    toggleActive(id: number): Promise<any>;
    update(id: number, data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
    }): Promise<any>;
    updatePassword(id: number, newPassword: string): Promise<{
        message: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
