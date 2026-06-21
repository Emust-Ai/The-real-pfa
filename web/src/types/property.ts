export type PropertyType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'LAND' | 'COMMERCIAL' | 'OFFICE' | 'STUDIO' | 'PENTHOUSE' | 'DUPLEX' | 'OTHER';

export type TransactionType = 'SALE' | 'RENT';

export type PropertyStatus = 'AVAILABLE' | 'SOLD' | 'RENTED' | 'PENDING';

export interface Property {
  id: number;
  title: string;
  description?: string;
  price: number;
  surface?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType: PropertyType;
  transactionType: TransactionType;
  status: PropertyStatus;
  address?: string;
  city?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  features: string[];
  retailerId: number;
  retailer: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
  };
  scrapedFrom?: string;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    favorites: number;
    inquiries?: number;
  };
}

export interface PropertyListResponse {
  data: Property[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreatePropertyPayload {
  title: string;
  description?: string;
  price: number;
  surface?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: PropertyType;
  transactionType?: TransactionType;
  address?: string;
  city?: string;
  province?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  features?: string[];
}

export type UpdatePropertyPayload = Partial<CreatePropertyPayload>;

export interface Favorite {
  id: number;
  userId: number;
  propertyId: number;
  property: Property;
  createdAt: string;
}

export interface Inquiry {
  id: number;
  message: string;
  userId: number;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  propertyId: number;
  property: {
    id: number;
    title: string;
  };
  createdAt: string;
}
