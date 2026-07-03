import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { PropertyCard } from '../components/property/PropertyCard';
import { SearchBar } from '../components/search/SearchBar';
import { Button } from '../components/ui/button';
import type { PropertyListResponse, PropertyType, TransactionType } from '../types/property';

export function PropertyList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [propertyType, setPropertyType] = useState<(PropertyType | '')>(searchParams.get('propertyType') as PropertyType ?? '');
  const [transactionType, setTransactionType] = useState<(TransactionType | '')>(searchParams.get('transactionType') as TransactionType ?? '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (propertyType) params.set('propertyType', propertyType);
  if (transactionType) params.set('transactionType', transactionType);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);
  params.set('page', String(page));
  params.set('limit', '20');

  const { data, isLoading } = useQuery<PropertyListResponse>({
    queryKey: ['properties', params.toString()],
    queryFn: () => api.get(`/properties?${params}`).then(r => r.data),
  });

  const handleSearch = () => { setPage(1); };

  const handleAiFilters = (filters: Record<string, string>) => {
    if (filters.search !== undefined) setSearch(filters.search);
    if (filters.propertyType !== undefined) setPropertyType(filters.propertyType as PropertyType);
    if (filters.transactionType !== undefined) setTransactionType(filters.transactionType as TransactionType);
    if (filters.minPrice !== undefined) setMinPrice(filters.minPrice);
    if (filters.maxPrice !== undefined) setMaxPrice(filters.maxPrice);
    setPage(1);
  };

  useEffect(() => {
    setSearchParams(params);
  }, [search, propertyType, transactionType, minPrice, maxPrice, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Properties</h1>

      <SearchBar
        search={search} onSearchChange={setSearch}
        propertyType={propertyType} onPropertyTypeChange={setPropertyType}
        transactionType={transactionType} onTransactionTypeChange={setTransactionType}
        minPrice={minPrice} onMinPriceChange={setMinPrice}
        maxPrice={maxPrice} onMaxPriceChange={setMaxPrice}
        onSearch={handleSearch}
        onSetFilters={handleAiFilters}
      />

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
      ) : data && data.data.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">{data.meta.total} properties found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.data.map(p => <PropertyCard key={p.id} property={p} />)}
          </div>
          <div className="flex justify-center items-center gap-3 pt-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {data.meta.page} of {data.meta.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= data.meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No properties found. Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
}
