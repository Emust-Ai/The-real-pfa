import { FavoritesService } from './favorites.service';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    findAll(userId: number): Promise<any>;
    add(userId: number, propertyId: number): Promise<any>;
    remove(userId: number, propertyId: number): Promise<void>;
}
