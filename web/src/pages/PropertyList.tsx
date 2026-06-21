import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { PropertyCard } from '../components/property/PropertyCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import type { PropertyListResponse, PropertyType, TransactionType } from '../types/property';

const propertyTypes: { value: PropertyType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'LAND', label: 'Land' },
  { value: 'COMMERCIAL', label: 'Commercial' },
];

const transactionTypes: { value: TransactionType | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'SALE', label: 'For Sale' },
  { value: 'RENT', label: 'For Rent' },
];

export function PropertyList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [city, setCity] = useState(searchParams.get('city') ?? '');
  const [propertyType, setPropertyType] = useState<(PropertyType | '')>(searchParams.get('propertyType') as PropertyType ?? '');
  const [transactionType, setTransactionType] = useState<(TransactionType | '')>(searchParams.get('transactionType') as TransactionType ?? '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const scrapedFrom = searchParams.get('scrapedFrom') ?? '';

  const params = new URLSearchParams();
  if (city) params.set('city', city);
  if (scrapedFrom) params.set('scrapedFrom', scrapedFrom);
  if (propertyType) params.set('propertyType', propertyType);
  if (transactionType) params.set('transactionType', transactionType);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);
  params.set('page', String(page));
  params.set('limit', '12');

  const { data, isLoading } = useQuery<PropertyListResponse>({
    queryKey: ['properties', params.toString()],
    queryFn: () => api.get(`/properties?${params}`).then(r => r.data),
  });

  useEffect(() => {
    setSearchParams(params);
  }, [city, propertyType, transactionType, minPrice, maxPrice, page]);

  const handleFilter = () => { setPage(1); };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Properties</h1>

      <div className="flex flex-wrap gap-3 items-end bg-card p-4 rounded-lg border">
        <div>
          <label className="text-xs text-muted-foreground">City</label>
          <Input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Algiers" className="w-40" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Type</label>
          <select value={propertyType} onChange={e => setPropertyType(e.target.value as PropertyType)}
            className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm">
            {propertyTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Transaction</label>
          <select value={transactionType} onChange={e => setTransactionType(e.target.value as TransactionType)}
            className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm">
            {transactionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Min Price (TND)</label>
          <Input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" className="w-32" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Max Price (TND)</label>
          <Input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="999M" className="w-32" />
        </div>
        <Button onClick={handleFilter}>Filter</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading properties...</p>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.data.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="flex items-center text-sm text-muted-foreground">Page {data.meta.page} of {data.meta.totalPages}</span>
            <Button variant="outline" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">No properties found.</p>
      )}
    </div>
  );
}
