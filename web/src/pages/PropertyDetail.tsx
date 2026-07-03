import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ReviewSection } from '../components/reviews/ReviewSection';
import { Building2, MapPin, Bed, Bath, Maximize2, Heart, MessageSquare, ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Star } from 'lucide-react';
import { toast } from '../components/ui/toast';
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
    onSuccess: () => { setInquiryMsg(''); toast('Inquiry sent!', 'success'); },
  });

  const openConversation = useMutation({
    mutationFn: () => api.post(`/properties/${id}/conversation`),
    onSuccess: (res) => navigate(`/conversations?open=${res.data.id}`),
    onError: () => toast('Failed to open conversation', 'error'),
  });

  if (isLoading) return <div className="max-w-5xl mx-auto px-6 py-8"><p className="text-muted-foreground">Loading...</p></div>;
  if (!property) return <div className="max-w-5xl mx-auto px-6 py-8"><p className="text-muted-foreground">Property not found.</p></div>;

  const priceFormatted = new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(property.price);
  const images = property.images?.filter(Boolean) ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {/* Photo hero */}
      <div className="relative rounded-md overflow-hidden bg-muted aspect-video">
        {images.length > 0 ? (
          <img src={images[imgIdx]} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Building2 className="h-16 w-16" />
          </div>
        )}
        {images.length > 1 && (
          <>
            <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors cursor-pointer">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors cursor-pointer">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${i === imgIdx ? 'w-6 bg-white' : 'w-2 bg-white/60'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title + price header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold leading-tight">{property.title}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />{property.city ?? property.address ?? 'Location not specified'}
              </p>
            </div>
            <p className="text-2xl font-bold text-primary shrink-0">{priceFormatted}</p>
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">{typeLabels[property.propertyType] ?? property.propertyType}</Badge>
            <Badge variant="outline" className="capitalize">{property.transactionType === 'RENT' ? 'For Rent' : 'For Sale'}</Badge>
            <Badge variant={property.status === 'AVAILABLE' ? 'success' : 'outline'} className="capitalize">{property.status.toLowerCase()}</Badge>
          </div>

          {/* Features row */}
          <div className="flex flex-wrap gap-6 text-sm">
            {property.surface && <span className="flex items-center gap-2"><Maximize2 className="h-4 w-4 text-muted-foreground" /> {property.surface} m²</span>}
            {property.bedrooms && <span className="flex items-center gap-2"><Bed className="h-4 w-4 text-muted-foreground" /> {property.bedrooms} bedrooms</span>}
            {property.bathrooms && <span className="flex items-center gap-2"><Bath className="h-4 w-4 text-muted-foreground" /> {property.bathrooms} bathrooms</span>}
            {property.rooms && <span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /> {property.rooms} rooms</span>}
          </div>

          {/* Description */}
          {property.description && (
            <div className="border-t border-hairline pt-6">
              <h2 className="text-lg font-semibold mb-3">About this property</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>
          )}

          {/* Features tags */}
          {property.features?.length > 0 && (
            <div className="border-t border-hairline pt-6">
              <h2 className="text-lg font-semibold mb-3">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {property.features.map((f, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="border-t border-hairline pt-6">
            <ReviewSection propertyId={property.id} propertyRetailerId={property.retailerId} />
          </div>
        </div>

        {/* Right column: actions */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {user && user.id !== property.retailerId && (
            <Card>
              <CardContent className="p-5 space-y-3">
                <Button className="w-full gap-2" onClick={() => openConversation.mutate()} disabled={openConversation.isPending}>
                  <MessageSquare className="h-4 w-4" /> Message Retailer
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={() => isFav ? removeFav.mutate() : addFav.mutate()}>
                  <Heart className={`h-4 w-4 ${isFav ? 'fill-primary text-primary' : ''}`} />
                  {isFav ? 'Remove from Favorites' : 'Save to Favorites'}
                </Button>
              </CardContent>
            </Card>
          )}

          {user && user.id !== property.retailerId && (
            <Card>
              <CardHeader><CardTitle className="text-base">Contact Retailer</CardTitle></CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-sm text-muted-foreground">{property.retailer.firstName ?? property.retailer.email}</p>
                <Input value={inquiryMsg} onChange={e => setInquiryMsg(e.target.value)}
                  placeholder="Write your message..." />
                <Button className="w-full gap-2" disabled={!inquiryMsg || inquiryMsg.length < 10 || sendInquiry.isPending} onClick={() => sendInquiry.mutate()}>
                  <MessageSquare className="h-4 w-4" /> Send Inquiry
                </Button>
              </CardContent>
            </Card>
          )}

          {property.sourceUrl && (
            <Card>
              <CardHeader><CardTitle className="text-base">Source</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <a href={property.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1 break-all">
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  {new URL(property.sourceUrl).hostname}
                </a>
                {property.scrapedFrom && <p className="text-xs text-muted-foreground mt-1">Scraped from {property.scrapedFrom}</p>}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Listed by</CardTitle></CardHeader>
            <CardContent className="pt-0">
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
