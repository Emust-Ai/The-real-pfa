import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: import("@prisma/client").$Enums.Role;
        id: number;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        id: number;
        avatar: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    updateRole(id: number, role: Role): Promise<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: import("@prisma/client").$Enums.Role;
        id: number;
        isActive: boolean;
    }>;
    toggleActive(id: number): Promise<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: import("@prisma/client").$Enums.Role;
        id: number;
        isActive: boolean;
    }>;
    update(id: number, data: {
        firstName?: string;
        lastName?: string;
        phone?: string;
    }): Promise<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        id: number;
        isActive: boolean;
    }>;
    updatePassword(id: number, newPassword: string): Promise<{
        message: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
