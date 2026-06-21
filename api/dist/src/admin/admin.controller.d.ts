import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<{
        users: {
            total: number;
            byRole: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.UserGroupByOutputType, "role"[]> & {
                _count: number;
            })[];
        };
        properties: {
            total: number;
            byType: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.PropertyGroupByOutputType, "propertyType"[]> & {
                _count: number;
            })[];
            byStatus: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.PropertyGroupByOutputType, "status"[]> & {
                _count: number;
            })[];
            byTransaction: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.PropertyGroupByOutputType, "transactionType"[]> & {
                _count: number;
            })[];
            weeklyNew: number;
            avgPrice: import("@prisma/client-runtime-utils").Decimal | null;
        };
        inquiries: {
            total: number;
        };
        recentJobs: ({
            source: {
                name: string;
            };
        } & {
            error: string | null;
            id: number;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ScrapingJobStatus;
            sourceId: number;
            totalUrls: number;
            scrapedUrls: number;
            failedUrls: number;
            propertiesFound: number;
            startedAt: Date | null;
            completedAt: Date | null;
        })[];
    }>;
}
