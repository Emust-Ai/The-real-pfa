import { Role } from '@prisma/client';
import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
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
    update(id: number, body: {
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
    updatePassword(id: number, password: string): Promise<{
        message: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    getProfile(userId: number): Promise<{
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
    updateProfile(userId: number, body: {
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
    updateMyPassword(userId: number, password: string): Promise<{
        message: string;
    }>;
}
