import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { PropertyCard } from '../components/property/PropertyCard';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import type { Property } from '../types/property';

export function MyProperties() {
  const { data, isLoading } = useQuery<Property[]>({
    queryKey: ['my-properties'],
    queryFn: () => api.get('/properties/my').then(r => r.data),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Properties</h1>
        <Link to="/properties/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Add Property</Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : data && data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(p => (
            <div key={p.id} className="relative">
              <PropertyCard property={p} />
              <div className="flex gap-2 mt-2">
                <Link to={`/properties/${p.id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">You haven't listed any properties yet.</p>
      )}
    </div>
  );
}
