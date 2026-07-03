import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Bed, Bath, Maximize2, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Property } from '../../types/property';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

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
  const [imgIdx, setImgIdx] = useState(0);
  const images = property.images?.filter(Boolean) ?? [];
  const img = images[imgIdx];

  const priceFormatted = new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(property.price);

  return (
    <div className="group">
      <Link to={`/properties/${property.id}`} className="block">
        <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-muted">
          {img ? (
            <img src={img} alt={property.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Building2 className="h-12 w-12" />
            </div>
          )}

          <span className="absolute top-3 left-3">
            <Badge variant="default" className="shadow-sm text-xs font-medium">
              {property.transactionType === 'RENT' ? 'For Rent' : 'For Sale'}
            </Badge>
          </span>

          {onToggleFavorite && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleFavorite(property.id); }}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors cursor-pointer"
            >
              <Heart className={cn('h-4 w-4', isFavorite ? 'fill-primary text-primary' : 'text-foreground')} />
            </button>
          )}

          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.preventDefault(); setImgIdx(i => (i - 1 + images.length) % images.length); }}
                className="absolute left-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={(e) => { e.preventDefault(); setImgIdx(i => (i + 1) % images.length); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <button key={i} onClick={(e) => { e.preventDefault(); setImgIdx(i); }}
                    className={cn('h-1.5 rounded-full transition-all cursor-pointer', i === imgIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/60')} />
                ))}
              </div>
            </>
          )}
        </div>
      </Link>

      <Link to={`/properties/${property.id}`} className="block mt-2 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight line-clamp-1">{property.title}</h3>
          <p className="text-sm font-semibold shrink-0">{priceFormatted}</p>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          {property.city ?? property.address ?? 'Location not specified'}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          {property.surface && <span className="flex items-center gap-0.5"><Maximize2 className="h-3 w-3" />{property.surface} m²</span>}
          {property.bedrooms && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" />{property.bedrooms}</span>}
          {property.bathrooms && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{property.bathrooms}</span>}
        </div>
      </Link>
    </div>
  );
}
