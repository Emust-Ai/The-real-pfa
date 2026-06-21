import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Property' : 'New Property'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Title" value={form.title} onChange={e => set('title', e.target.value)} required />
            <div>
              <label className="text-xs text-muted-foreground">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price (TND)" type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} required />
              <Input label="Surface (m²)" type="number" value={form.surface ?? ''} onChange={e => set('surface', e.target.value ? Number(e.target.value) : undefined)} />
              <Input label="Rooms" type="number" value={form.rooms ?? ''} onChange={e => set('rooms', e.target.value ? Number(e.target.value) : undefined)} />
              <Input label="Bedrooms" type="number" value={form.bedrooms ?? ''} onChange={e => set('bedrooms', e.target.value ? Number(e.target.value) : undefined)} />
              <Input label="Bathrooms" type="number" value={form.bathrooms ?? ''} onChange={e => set('bathrooms', e.target.value ? Number(e.target.value) : undefined)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Property Type</label>
                <select value={form.propertyType} onChange={e => set('propertyType', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {propertyTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Transaction</label>
                <select value={form.transactionType} onChange={e => set('transactionType', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
            <div className="flex gap-4">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
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
