import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
export declare class PropertiesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreatePropertyDto, retailerId: number): Promise<any>;
    findAll(query: QueryPropertyDto): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdatePropertyDto, userId: number, userRole: string): Promise<any>;
    remove(id: number, userId: number, userRole: string): Promise<void>;
    findMyProperties(userId: number): Promise<any>;
}
