import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Plus, Pencil, Trash2, MapPin, Building2 } from 'lucide-react';
import type { Property } from '../types/property';

const statusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'outline' }> = {
  AVAILABLE: { label: 'Available', variant: 'success' },
  SOLD: { label: 'Sold', variant: 'default' },
  RENTED: { label: 'Rented', variant: 'default' },
  PENDING: { label: 'Pending', variant: 'outline' },
};

export function MyProperties() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<Property[]>({
    queryKey: ['my-properties'],
    queryFn: () => api.get('/properties/my').then(r => r.data),
  });

  const deleteProp = useMutation({
    mutationFn: (id: number) => api.delete(`/properties/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-properties'] }),
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Properties</h1>
        <Link to="/properties/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Add Property</Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map(p => {
            const image = p.images?.filter(Boolean)[0];
            const statusInfo = statusLabels[p.status] ?? { label: p.status, variant: 'outline' as const };
            const priceFormatted = new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(p.price);

            return (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {image ? (
                      <img src={image} alt={p.title} className="w-24 h-18 rounded-sm object-cover shrink-0" />
                    ) : (
                      <div className="w-24 h-18 rounded-sm bg-muted flex items-center justify-center shrink-0">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold">{p.title}</h3>
                          <p className="text-sm font-semibold mt-0.5">{priceFormatted}</p>
                        </div>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {p.city ?? p.address ?? 'Location not specified'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Link to={`/properties/${p.id}/edit`}>
                        <Button variant="outline" size="sm"><Pencil className="h-3.5 w-3.5" /></Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => { if (confirm('Delete this property?')) deleteProp.mutate(p.id); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground">You haven't listed any properties yet.</p>
      )}
    </div>
  );
}
