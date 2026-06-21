import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Building2, MapPin, Bed, Bath, Maximize2, Heart, MessageSquare, ArrowLeft, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { Property } from '../types/property';

const typeLabels: Record<string, string> = {
  APARTMENT: 'Apartment', HOUSE: 'House', VILLA: 'Villa',
  LAND: 'Land', COMMERCIAL: 'Commercial', OFFICE: 'Office',
  STUDIO: 'Studio', PENTHOUSE: 'Penthouse', DUPLEX: 'Duplex', OTHER: 'Other',
};

export function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [imgIdx, setImgIdx] = useState(0);
  const [inquiryMsg, setInquiryMsg] = useState('');

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ['property', id],
    queryFn: () => api.get(`/properties/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.get('/favorites').then(r => r.data),
    enabled: !!user,
  });

  const isFav = favorites?.some((f: any) => f.propertyId === Number(id));

  const addFav = useMutation({
    mutationFn: () => api.post(`/favorites/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const removeFav = useMutation({
    mutationFn: () => api.delete(`/favorites/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const sendInquiry = useMutation({
    mutationFn: () => api.post(`/inquiries/${id}`, { message: inquiryMsg }),
    onSuccess: () => { setInquiryMsg(''); alert('Inquiry sent!'); },
  });

  if (isLoading) return <div className="p-6"><p className="text-muted-foreground">Loading...</p></div>;
  if (!property) return <div className="p-6"><p className="text-muted-foreground">Property not found.</p></div>;

  const priceFormatted = new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(property.price);
  const images = property.images?.length ? property.images : null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {images ? (
            <div className="relative">
              <img src={images[imgIdx]} alt={property.title} className="w-full aspect-video object-cover rounded-lg" />
              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-2">
                  <Button variant="ghost" size="icon" className="bg-background/60" onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="bg-background/60" onClick={() => setImgIdx(i => (i + 1) % images.length)}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              )}
              <div className="flex gap-1 mt-2">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${i === imgIdx ? 'bg-primary' : 'bg-muted'}`} />
                ))}
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <Building2 className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{property.title}</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />{property.city ?? property.address ?? 'Location not specified'}
                  </p>
                </div>
                <p className="text-2xl font-bold text-primary">{priceFormatted}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 text-sm">
                <span className="bg-secondary px-3 py-1 rounded-full capitalize">{typeLabels[property.propertyType] ?? property.propertyType}</span>
                <span className="bg-secondary px-3 py-1 rounded-full capitalize">{property.transactionType === 'RENT' ? 'For Rent' : 'For Sale'}</span>
                <span className="bg-secondary px-3 py-1 rounded-full capitalize">{property.status.toLowerCase()}</span>
              </div>

              <div className="flex gap-6 text-sm">
                {property.surface && <span className="flex items-center gap-1"><Maximize2 className="h-4 w-4" /> {property.surface} m²</span>}
                {property.bedrooms && <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {property.bedrooms} Bedrooms</span>}
                {property.bathrooms && <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property.bathrooms} Bathrooms</span>}
                {property.rooms && <span>{property.rooms} Rooms</span>}
              </div>

              {property.description && (
                <div>
                  <h3 className="font-semibold mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{property.description}</p>
                </div>
              )}

              {property.features?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-1">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((f, i) => (
                      <span key={i} className="text-xs bg-accent px-2 py-1 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {user && (
            <>
              <Card>
                <CardHeader><CardTitle className="text-lg">Actions</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Button variant={isFav ? 'destructive' : 'outline'} className="w-full gap-2"
                    onClick={() => isFav ? removeFav.mutate() : addFav.mutate()}>
                    <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                    {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-lg">Contact Retailer</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {property.retailer.firstName ?? property.retailer.email}
                  </p>
                  <Input value={inquiryMsg} onChange={e => setInquiryMsg(e.target.value)}
                    placeholder="Write your message..." />
                  <Button className="w-full gap-2" disabled={!inquiryMsg || inquiryMsg.length < 10 || sendInquiry.isPending}
                    onClick={() => sendInquiry.mutate()}>
                    <MessageSquare className="h-4 w-4" /> Send Inquiry
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {property.sourceUrl && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Source</CardTitle></CardHeader>
              <CardContent>
                <a href={property.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1 break-all">
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  {property.sourceUrl}
                </a>
                {property.scrapedFrom && <p className="text-xs text-muted-foreground mt-1">Scraped from {property.scrapedFrom}</p>}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-lg">Listed by</CardTitle></CardHeader>
            <CardContent>
              <p className="font-medium">{property.retailer.firstName ?? 'N/A'} {property.retailer.lastName ?? ''}</p>
              <p className="text-sm text-muted-foreground">{property.retailer.email}</p>
              {property.retailer.phone && <p className="text-sm text-muted-foreground">{property.retailer.phone}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
