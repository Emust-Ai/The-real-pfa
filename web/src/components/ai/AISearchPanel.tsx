import { useState } from 'react';
import { Sparkles, Search, X } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../ui/button';
import { toast } from '../ui/toast';

interface AISearchPanelProps {
  onApplyFilters: (filters: Record<string, string>) => void;
  onClose: () => void;
}

export function AISearchPanel({ onApplyFilters, onClose }: AISearchPanelProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/groq/parse-search', { query: query.trim() });
      const filters: Record<string, string> = {};
      if (data.filters.search) filters.search = data.filters.search;
      if (data.filters.propertyType) filters.propertyType = data.filters.propertyType;
      if (data.filters.transactionType) filters.transactionType = data.filters.transactionType;
      if (data.filters.minPrice) filters.minPrice = String(data.filters.minPrice);
      if (data.filters.maxPrice) filters.maxPrice = String(data.filters.maxPrice);
      if (data.filters.rooms) filters.rooms = String(data.filters.rooms);
      if (data.filters.bedrooms) filters.bedrooms = String(data.filters.bedrooms);
      if (data.filters.city) filters.search = data.filters.city;
      onApplyFilters(filters);
      toast(data.summary || 'Search filters applied', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'AI search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-hairline bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Search
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <textarea
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Describe what you're looking for...&#10;e.g. &quot;3 bedroom villa in Sousse with pool under 800k&quot;"
        className="w-full h-24 rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground transition-colors resize-none"
      />
      <div className="flex justify-end">
        <Button onClick={handleSearch} disabled={loading || !query.trim()} className="gap-2">
          <Search className="h-4 w-4" />
          {loading ? 'Thinking...' : 'AI Search'}
        </Button>
      </div>
    </div>
  );
}
