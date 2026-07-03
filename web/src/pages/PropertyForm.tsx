import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DescriptionGenerator } from '../components/ai/DescriptionGenerator';
import type { Property, CreatePropertyPayload, PropertyType, TransactionType } from '../types/property';

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'LAND', label: 'Land' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'OFFICE', label: 'Office' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'PENTHOUSE', label: 'Penthouse' },
  { value: 'DUPLEX', label: 'Duplex' },
  { value: 'OTHER', label: 'Other' },
];

export function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [form, setForm] = useState<CreatePropertyPayload>({
    title: '', description: '', price: 0, surface: undefined,
    rooms: undefined, bedrooms: undefined, bathrooms: undefined,
    propertyType: 'APARTMENT', transactionType: 'SALE',
    address: '', city: '', province: '', images: [], features: [],
  });

  const { data: existing } = useQuery<Property>({
    queryKey: ['property', id],
    queryFn: () => api.get(`/properties/${id}`).then(r => r.data),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        description: existing.description ?? '',
        price: existing.price,
        surface: existing.surface ?? undefined,
        rooms: existing.rooms ?? undefined,
        bedrooms: existing.bedrooms ?? undefined,
        bathrooms: existing.bathrooms ?? undefined,
        propertyType: existing.propertyType,
        transactionType: existing.transactionType,
        address: existing.address ?? '',
        city: existing.city ?? '',
        province: existing.province ?? '',
        images: existing.images,
        features: existing.features,
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: (data: CreatePropertyPayload) =>
      isEdit ? api.patch(`/properties/${id}`, data) : api.post('/properties', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigate('/properties/my');
    },
  });

  const set = (key: keyof CreatePropertyPayload, value: any) => setForm(f => ({ ...f, [key]: value }));
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); mutation.mutate(form); };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Property' : 'Add Property'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Title" value={form.title} onChange={e => set('title', e.target.value)} required />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm text-muted-foreground">Description</label>
                <DescriptionGenerator
                  formData={{
                    title: form.title,
                    propertyType: form.propertyType,
                    features: form.features,
                    city: form.city,
                    surface: form.surface,
                    rooms: form.rooms,
                    bedrooms: form.bedrooms,
                    price: form.price,
                    transactionType: form.transactionType,
                  }}
                  onDescriptionGenerated={(desc) => set('description', desc)}
                />
              </div>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                className="flex h-32 w-full rounded-sm border border-border bg-background px-4 py-3 text-base outline-none focus:border-foreground transition-colors resize-y"
                placeholder="Describe the property..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Price (TND)" type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} required />
              <Input label="Surface (m²)" type="number" value={form.surface ?? ''} onChange={e => set('surface', e.target.value ? Number(e.target.value) : undefined)} />
              <Input label="Rooms" type="number" value={form.rooms ?? ''} onChange={e => set('rooms', e.target.value ? Number(e.target.value) : undefined)} />
              <Input label="Bedrooms" type="number" value={form.bedrooms ?? ''} onChange={e => set('bedrooms', e.target.value ? Number(e.target.value) : undefined)} />
              <Input label="Bathrooms" type="number" value={form.bathrooms ?? ''} onChange={e => set('bathrooms', e.target.value ? Number(e.target.value) : undefined)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Property Type</label>
                <select value={form.propertyType} onChange={e => set('propertyType', e.target.value)}
                  className="flex h-14 w-full rounded-sm border border-border bg-background px-4 py-3 text-base outline-none focus:border-foreground transition-colors">
                  {propertyTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-muted-foreground">Transaction</label>
                <select value={form.transactionType} onChange={e => set('transactionType', e.target.value)}
                  className="flex h-14 w-full rounded-sm border border-border bg-background px-4 py-3 text-base outline-none focus:border-foreground transition-colors">
                  <option value="SALE">For Sale</option>
                  <option value="RENT">For Rent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input label="Address" value={form.address ?? ''} onChange={e => set('address', e.target.value)} />
              <Input label="City" value={form.city ?? ''} onChange={e => set('city', e.target.value)} />
              <Input label="Province" value={form.province ?? ''} onChange={e => set('province', e.target.value)} />
            </div>

            <Input label="Features (comma-separated)" value={form.features?.join(', ') ?? ''} onChange={e => set('features', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
            <Input label="Image URLs (comma-separated)" value={form.images?.join(', ') ?? ''} onChange={e => set('images', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />

            <div className="flex gap-4">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : isEdit ? 'Update Property' : 'Add Property'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/properties/my')}>Cancel</Button>
            </div>

            {mutation.isError && <p className="text-destructive text-sm">{(mutation.error as any)?.response?.data?.message ?? 'An error occurred'}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
