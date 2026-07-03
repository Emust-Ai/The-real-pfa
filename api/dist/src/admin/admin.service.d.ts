import { PrismaService } from '../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        users: {
            total: any;
            byRole: any;
        };
        properties: {
            total: any;
            byType: any;
            byStatus: any;
            byTransaction: any;
            weeklyNew: any;
            avgPrice: any;
        };
        inquiries: {
            total: any;
        };
        recentJobs: any;
    }>;
    cleanupTestData(): Promise<{
        deleted: any;
        message: string;
    }>;
}
