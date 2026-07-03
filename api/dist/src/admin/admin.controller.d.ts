import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
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
