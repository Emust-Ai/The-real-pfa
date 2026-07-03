import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { PropertyCard } from '../components/property/PropertyCard';
import type { Favorite } from '../types/property';

export function FavoritesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<Favorite[]>({
    queryKey: ['favorites'],
    queryFn: () => api.get('/favorites').then(r => r.data),
  });

  const removeFav = useMutation({
    mutationFn: (propertyId: number) => api.delete(`/favorites/${propertyId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">My Favorites</h1>
      {data && data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {data.map(fav => (
            <PropertyCard key={fav.id} property={fav.property}
              isFavorite onToggleFavorite={(id) => removeFav.mutate(id)} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No favorites yet.</p>
      )}
    </div>
  );
}
