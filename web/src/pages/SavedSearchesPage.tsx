import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { toast } from '../components/ui/toast';

interface SavedSearch {
  id: number;
  name: string;
  filters: Record<string, any>;
  notifyInApp: boolean;
  notifyEmail: boolean;
  createdAt: string;
}

function filterSummary(filters: Record<string, any>): string {
  const parts: string[] = [];
  if (filters.propertyType) parts.push(filters.propertyType.toLowerCase());
  if (filters.transactionType) parts.push(filters.transactionType === 'SALE' ? 'for sale' : 'for rent');
  if (filters.city) parts.push(`in ${filters.city}`);
  if (filters.minPrice || filters.maxPrice) {
    const range = [
      filters.minPrice ? `${Number(filters.minPrice).toLocaleString()} DT` : '',
      filters.maxPrice ? `${Number(filters.maxPrice).toLocaleString()} DT` : '',
    ].filter(Boolean).join(' - ');
    if (range) parts.push(range);
  }
  return parts.join(', ') || 'All properties';
}

export function SavedSearchesPage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const filtersFromUrl = {
    propertyType: searchParams.get('propertyType') || undefined,
    transactionType: searchParams.get('transactionType') || undefined,
    minPrice: searchParams.get('minPrice') || undefined,
    maxPrice: searchParams.get('maxPrice') || undefined,
    search: searchParams.get('search') || undefined,
  };

  const { data: savedSearches, isLoading } = useQuery<SavedSearch[]>({
    queryKey: ['saved-searches'],
    queryFn: () => api.get('/saved-searches').then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; filters: Record<string, any>; notifyInApp: boolean; notifyEmail: boolean }) =>
      api.post('/saved-searches', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      setName('');
      setNotifyInApp(true);
      setNotifyEmail(false);
      toast('Saved search created', 'success');
    },
    onError: () => toast('Failed to create saved search', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SavedSearch> }) =>
      api.patch(`/saved-searches/${id}`, data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      setEditingId(null);
      toast('Saved search updated', 'success');
    },
    onError: () => toast('Failed to update saved search', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/saved-searches/${id}`).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      toast('Saved search deleted', 'success');
    },
    onError: () => toast('Failed to delete saved search', 'error'),
  });

  const handleSaveCurrentFilters = () => {
    if (!name.trim()) {
      toast('Please enter a name for your saved search', 'error');
      return;
    }
    createMutation.mutate({ name, filters: filtersFromUrl, notifyInApp, notifyEmail });
  };

  const toggleNotifyInApp = (search: SavedSearch) => {
    updateMutation.mutate({ id: search.id, data: { notifyInApp: !search.notifyInApp } });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Save Current Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Search Name"
            id="searchName"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Apartments in Tunis under 300k"
          />
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={notifyInApp} onChange={e => setNotifyInApp(e.target.checked)} />
              Notify in app
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={notifyEmail} onChange={e => setNotifyEmail(e.target.checked)} />
              Notify by email
            </label>
          </div>
          <Button onClick={handleSaveCurrentFilters} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Saving...' : 'Save Current Filters'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Saved Searches</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : savedSearches && savedSearches.length > 0 ? (
            <div className="space-y-3">
              {savedSearches.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{s.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{filterSummary(s.filters)}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={s.notifyInApp} onChange={() => toggleNotifyInApp(s)} />
                        In-app
                      </label>
                      <span>{s.notifyEmail ? 'Email ✓' : 'Email ✗'}</span>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(s.id)}>
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No saved searches yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
