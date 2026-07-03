import { Role } from '@prisma/client';
import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    updateRole(id: number, role: Role): Promise<any>;
    toggleActive(id: number): Promise<any>;
    update(id: number, body: {
        firstName?: string;
        lastName?: string;
        phone?: string;
    }): Promise<any>;
    updatePassword(id: number, password: string): Promise<{
        message: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    getProfile(userId: number): Promise<any>;
    updateProfile(userId: number, body: {
        firstName?: string;
        lastName?: string;
        phone?: string;
    }): Promise<any>;
    updateMyPassword(userId: number, password: string): Promise<{
        message: string;
    }>;
}
