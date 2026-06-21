import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuthStore } from '../stores/authStore';
import type { Inquiry } from '../types/property';

export function InquiriesPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery<Inquiry[]>({
    queryKey: ['inquiries'],
    queryFn: () => api.get('/inquiries').then(r => r.data),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        {user?.role === 'RETAILER' ? 'Inquiries about my properties' : 'My Inquiries'}
      </h1>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map(inquiry => (
            <Card key={inquiry.id}>
              <CardHeader>
                <CardTitle className="text-base">{inquiry.property.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{inquiry.message}</p>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>From: {inquiry.user ? `${inquiry.user.firstName ?? ''} ${inquiry.user.lastName ?? ''} (${inquiry.user.email})` : 'You'}</span>
                  <span>{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No inquiries yet.</p>
      )}
    </div>
  );
}
