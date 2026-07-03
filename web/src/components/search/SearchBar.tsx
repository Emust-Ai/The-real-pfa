import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { AISearchPanel } from '../ai/AISearchPanel';
import type { PropertyType, TransactionType } from '../../types/property';

interface SearchBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  propertyType: PropertyType | '';
  onPropertyTypeChange: (v: PropertyType | '') => void;
  transactionType: TransactionType | '';
  onTransactionTypeChange: (v: TransactionType | '') => void;
  minPrice: string;
  onMinPriceChange: (v: string) => void;
  maxPrice: string;
  onMaxPriceChange: (v: string) => void;
  onSearch: () => void;
  onSetFilters?: (filters: Record<string, string>) => void;
}

const propertyTypes: { value: PropertyType | ''; label: string }[] = [
  { value: '', label: 'Any' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'HOUSE', label: 'House' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'LAND', label: 'Land' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'OFFICE', label: 'Office' },
];

const transactionTypes: { value: TransactionType | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'SALE', label: 'For Sale' },
  { value: 'RENT', label: 'For Rent' },
];

export function SearchBar({
  search, onSearchChange,
  propertyType, onPropertyTypeChange,
  transactionType, onTransactionTypeChange,
  minPrice, onMinPriceChange,
  maxPrice, onMaxPriceChange,
  onSearch,
  onSetFilters,
}: SearchBarProps) {
  const [aiMode, setAiMode] = useState(false);

  const handleAiFilters = (filters: Record<string, string>) => {
    if (onSetFilters) {
      onSetFilters(filters);
    }
    setAiMode(false);
  };

  return (
    <div className="space-y-3">
      {aiMode && (
        <AISearchPanel onApplyFilters={handleAiFilters} onClose={() => setAiMode(false)} />
      )}
    <div className="flex items-center bg-background border rounded-full h-14 shadow-sm hover:shadow-md transition-shadow divide-x divide-hairline">
      <div className="flex-1 px-5 min-w-0">
        <p className="text-[11px] font-semibold text-foreground uppercase tracking-wide">Where</p>
        <input value={search} onChange={e => onSearchChange(e.target.value)}
          placeholder="Search location..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>
      <div className="px-5">
        <p className="text-[11px] font-semibold text-foreground uppercase tracking-wide">Type</p>
        <select value={propertyType} onChange={e => onPropertyTypeChange(e.target.value as PropertyType | '')}
          className="bg-transparent text-sm outline-none text-muted-foreground">
          {propertyTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="px-5">
        <p className="text-[11px] font-semibold text-foreground uppercase tracking-wide">Price</p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <input type="number" value={minPrice} onChange={e => onMinPriceChange(e.target.value)} placeholder="Min"
            className="w-16 bg-transparent outline-none placeholder:text-muted-foreground" />
          <span>-</span>
          <input type="number" value={maxPrice} onChange={e => onMaxPriceChange(e.target.value)} placeholder="Max"
            className="w-16 bg-transparent outline-none placeholder:text-muted-foreground" />
        </div>
      </div>
      <div className="px-2 flex items-center gap-1">
        <button
          onClick={() => setAiMode(!aiMode)}
          className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
            aiMode ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'
          }`}
          title="AI Search"
        >
          <Sparkles className="h-5 w-5" />
        </button>
        <Button size="icon" className="h-12 w-12 rounded-full" onClick={onSearch}>
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </div>
    </div>
  );
}
