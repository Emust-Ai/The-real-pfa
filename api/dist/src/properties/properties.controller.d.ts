import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertyDto } from './dto/query-property.dto';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    findAll(query: QueryPropertyDto): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findMy(userId: number): Promise<any>;
    findOne(id: number): Promise<any>;
    create(dto: CreatePropertyDto, userId: number): Promise<any>;
    update(id: number, dto: UpdatePropertyDto, user: {
        id: number;
        role: string;
    }): Promise<any>;
    remove(id: number, user: {
        id: number;
        role: string;
    }): Promise<void>;
}
