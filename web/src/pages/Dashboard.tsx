import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { PropertyCard } from '../components/property/PropertyCard';
import { Button } from '../components/ui/button';
import type { PropertyListResponse } from '../types/property';

export function Dashboard() {
  const { user } = useAuthStore();

  const { data: recent } = useQuery<PropertyListResponse>({
    queryKey: ['properties', 'recent'],
    queryFn: () => api.get('/properties?limit=8&sortBy=createdAt').then(r => r.data),
  });

  const { data: favProps } = useQuery<PropertyListResponse>({
    queryKey: ['properties', 'favorites-dash'],
    queryFn: () => api.get('/properties?limit=4&sortBy=createdAt').then(r => r.data),
    enabled: user?.role === 'CLIENT' || user?.role === 'BUILDER',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome{user?.firstName ? `, ${user.firstName}` : ''}
        </h1>
        <p className="text-muted-foreground">Discover your next property</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/properties">
          <Button variant="default" size="lg">Browse Properties</Button>
        </Link>
        {(user?.role === 'RETAILER' || user?.role === 'SUPER_ADMIN') && (
          <Link to="/properties/new">
            <Button variant="outline" size="lg">Add a Property</Button>
          </Link>
        )}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Properties</h2>
          <Link to="/properties" className="text-sm text-primary hover:underline font-medium">View all</Link>
        </div>
        {recent && recent.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {recent.data.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
        ) : (
          <p className="text-muted-foreground">No properties yet.</p>
        )}
      </section>

      {(user?.role === 'CLIENT' || user?.role === 'BUILDER') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Favorites</h2>
            <Link to="/favorites" className="text-sm text-primary hover:underline font-medium">View all</Link>
          </div>
          <div className="bg-surface-soft rounded-md p-8 text-center">
            <p className="text-muted-foreground mb-3">Save your favorite properties to find them later.</p>
            <Link to="/properties"><Button variant="outline">Browse Properties</Button></Link>
          </div>
        </section>
      )}

      {(user?.role === 'RETAILER' || user?.role === 'SUPER_ADMIN') && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Your Listings</h2>
          <Link to="/properties/my">
            <Button variant="outline">View My Properties</Button>
          </Link>
        </section>
      )}
    </div>
  );
}
