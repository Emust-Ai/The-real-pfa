import { Role } from '@prisma/client';
import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: number;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        avatar: string | null;
        isActive: boolean;
        createdAt: Date;
    }>;
    updateRole(id: number, role: Role): Promise<{
        id: number;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
    }>;
    toggleActive(id: number): Promise<{
        id: number;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
    }>;
    update(id: number, body: {
        firstName?: string;
        lastName?: string;
        phone?: string;
    }): Promise<{
        id: number;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
        role: import("@prisma/client").$Enums.Role;
        isActive: boolean;
    }>;
    updatePassword(id: number, password: string): Promise<{
        message: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
