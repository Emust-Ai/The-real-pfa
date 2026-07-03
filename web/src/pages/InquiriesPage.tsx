import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import type { Inquiry } from '../types/property';

export function InquiriesPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery<Inquiry[]>({
    queryKey: ['inquiries'],
    queryFn: () => api.get('/inquiries').then(r => r.data),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        {user?.role === 'RETAILER' ? 'Inquiries about my properties' : 'My Inquiries'}
      </h1>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map(inquiry => (
            <div key={inquiry.id} className="rounded-md border bg-card p-5 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm">{inquiry.property.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    From: {inquiry.user ? `${inquiry.user.firstName ?? ''} ${inquiry.user.lastName ?? ''} (${inquiry.user.email})` : 'You'}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{inquiry.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No inquiries yet.</p>
      )}
    </div>
  );
}
