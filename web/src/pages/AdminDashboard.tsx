import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Building2, Users, MessageSquare, TrendingUp, Activity } from 'lucide-react';

interface AdminStats {
  users: { total: number; byRole: { role: string; _count: number }[] };
  properties: {
    total: number;
    byType: { propertyType: string; _count: number }[];
    byStatus: { status: string; _count: number }[];
    byTransaction: { transactionType: string; _count: number }[];
    weeklyNew: number;
    avgPrice: number | null;
  };
  inquiries: { total: number };
  recentJobs: {
    id: number;
    status: string;
    propertiesFound: number;
    createdAt: string;
    source: { name: string };
  }[];
}

export function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
    refetchInterval: 30000,
  });

  if (isLoading) return <p className="text-muted-foreground">Loading dashboard...</p>;
  if (!stats) return <p className="text-muted-foreground">Failed to load stats.</p>;

  const typeLabels: Record<string, string> = {
    APARTMENT: 'Apartments', HOUSE: 'Houses', VILLA: 'Villas',
    LAND: 'Lands', COMMERCIAL: 'Commercial', OFFICE: 'Offices',
    STUDIO: 'Studios', PENTHOUSE: 'Penthouses', DUPLEX: 'Duplexes', OTHER: 'Other',
  };

  const statCards = [
    {
      icon: Building2, label: 'Total Properties',
      value: stats.properties.total, sub: `${stats.properties.weeklyNew} this week`,
    },
    {
      icon: Users, label: 'Total Users',
      value: stats.users.total,
      sub: stats.users.byRole.map(r => `${r.role.toLowerCase()}s: ${r._count}`).join(', '),
    },
    {
      icon: MessageSquare, label: 'Inquiries',
      value: stats.inquiries.total, sub: 'Total received',
    },
    {
      icon: TrendingUp, label: 'Avg. Price',
      value: stats.properties.avgPrice
        ? new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(Number(stats.properties.avgPrice))
        : 'N/A',
      sub: 'Across all listings',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-md border bg-card p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Properties by Type</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.properties.byType.map(t => (
                <div key={t.propertyType} className="flex items-center justify-between text-sm">
                  <span>{typeLabels[t.propertyType] ?? t.propertyType}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full"
                        style={{ width: `${(t._count / stats.properties.total) * 100}%` }} />
                    </div>
                    <span className="font-medium w-8 text-right">{t._count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.properties.byStatus.map(s => (
                <div key={s.status} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{s.status.toLowerCase()}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{
                          width: `${(s._count / stats.properties.total) * 100}%`,
                          backgroundColor: s.status === 'AVAILABLE' ? '#22c55e' : s.status === 'SOLD' ? '#ef4444' : '#f59e0b',
                        }} />
                    </div>
                    <span className="font-medium w-8 text-right">{s._count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-4 w-4" /> Recent Scraping Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scraping jobs yet.</p>
          ) : (
            <div className="space-y-2">
              {stats.recentJobs.map(job => (
                <div key={job.id} className="flex items-center justify-between text-sm border-b border-hairline pb-2 last:border-0">
                  <div className="flex items-center gap-2">
                    {job.status === 'COMPLETED' ? (
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                    ) : job.status === 'FAILED' ? (
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    )}
                    <span className="font-medium">{job.source.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{job.status}</span>
                    <span>{job.propertiesFound} found</span>
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
