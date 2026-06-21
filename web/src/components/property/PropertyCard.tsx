import { Link } from 'react-router-dom';
import { Building2, MapPin, Bed, Bath, Maximize2, Heart } from 'lucide-react';
import type { Property } from '../../types/property';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

const typeLabels: Record<string, string> = {
  APARTMENT: 'Apartment', HOUSE: 'House', VILLA: 'Villa',
  LAND: 'Land', COMMERCIAL: 'Commercial', OFFICE: 'Office',
  STUDIO: 'Studio', PENTHOUSE: 'Penthouse', DUPLEX: 'Duplex', OTHER: 'Other',
};

interface PropertyCardProps {
  property: Property;
  onToggleFavorite?: (id: number) => void;
  isFavorite?: boolean;
}

export function PropertyCard({ property, onToggleFavorite, isFavorite }: PropertyCardProps) {
  const img = property.images?.[0];
  const priceFormatted = new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(property.price);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/properties/${property.id}`}>
        <div className="aspect-video bg-muted relative">
          {img ? (
            <img src={img} alt={property.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Building2 className="h-12 w-12" />
            </div>
          )}
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md capitalize">
            {property.transactionType === 'RENT' ? 'For Rent' : 'For Sale'}
          </span>
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background"
              onClick={(e) => { e.preventDefault(); onToggleFavorite(property.id); }}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/properties/${property.id}`} className="hover:underline">
          <h3 className="font-semibold truncate">{property.title}</h3>
        </Link>
        <p className="text-lg font-bold text-primary mt-1">{priceFormatted}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3" />
          {property.city ?? property.address ?? 'Location not specified'} — {typeLabels[property.propertyType] ?? property.propertyType}
        </p>
        <div className="flex gap-3 mt-3 text-sm text-muted-foreground">
          {property.surface && <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" />{property.surface} m²</span>}
          {property.bedrooms && <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{property.bedrooms}</span>}
          {property.bathrooms && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{property.bathrooms}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
