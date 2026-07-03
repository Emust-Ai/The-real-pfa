import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../ui/button';
import { toast } from '../ui/toast';

interface DescriptionGeneratorProps {
  formData: {
    title: string;
    propertyType: string;
    features: string[];
    city: string;
    surface?: number;
    rooms?: number;
    bedrooms?: number;
    price?: number;
    transactionType: string;
  };
  onDescriptionGenerated: (description: string) => void;
}

export function DescriptionGenerator({ formData, onDescriptionGenerated }: DescriptionGeneratorProps) {
  const [loading, setLoading] = useState(false);

  const canGenerate = formData.title && formData.title.length > 2;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    try {
      const { data } = await api.post('/groq/generate-description', formData);
      onDescriptionGenerated(data.description);
      toast('Description generated!', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message || 'Failed to generate description', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={loading || !canGenerate}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {loading ? 'Generating...' : 'AI Generate Description'}
    </Button>
  );
}
