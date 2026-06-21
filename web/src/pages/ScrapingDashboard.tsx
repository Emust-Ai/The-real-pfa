import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { Play, Plus, Trash2, Loader2, ExternalLink } from 'lucide-react';

interface Source {
  id: number;
  name: string;
  baseUrl: string;
  selectors: Record<string, string>;
  isActive: boolean;
  usePuppeteer: boolean;
  createdAt: string;
}

interface Job {
  id: number;
  sourceId: number;
  source: { id: number; name: string };
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  totalUrls: number;
  scrapedUrls: number;
  failedUrls: number;
  propertiesFound: number;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  createdAt: string;
}

const defaultSelectors = {
  listingSelector: 'article, .listing, .ad',
  titleSelector: 'h2, h3',
  priceSelector: '[class*=price]',
  descSelector: 'p',
  locationSelector: '[class*=location], [class*=city]',
  surfaceSelector: '[class*=surface], [class*=area]',
  roomsSelector: '[class*=room]',
  imageSelector: 'img',
};

export function ScrapingDashboard() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [usePuppeteer, setUsePuppeteer] = useState(false);

  const { data: sources, isLoading: srcLoading } = useQuery<Source[]>({
    queryKey: ['scraping-sources'],
    queryFn: () => api.get('/scraping/sources').then(r => r.data),
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ['scraping-jobs'],
    queryFn: () => api.get('/scraping/jobs').then(r => r.data),
  });

  const createSource = useMutation({
    mutationFn: () => api.post('/scraping/sources', { name, baseUrl, selectors: defaultSelectors, usePuppeteer }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['scraping-sources'] }); setShowForm(false); setName(''); setBaseUrl(''); setUsePuppeteer(false); },
  });

  const deleteSource = useMutation({
    mutationFn: (id: number) => api.delete(`/scraping/sources/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scraping-sources'] }),
  });

  const startJob = useMutation({
    mutationFn: (sourceId: number) => api.post(`/scraping/jobs/${sourceId}/start`),
    onSuccess: () => setTimeout(() => queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] }), 1000),
  });

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      RUNNING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full ${colors[status] ?? 'bg-gray-100'}`}>{status}</span>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Scraping Dashboard</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Source
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Scraping Source</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input label="Source Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tayara" />
            <Input label="Base URL" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://www.tayara.tn/immobilier" />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={usePuppeteer} onChange={e => setUsePuppeteer(e.target.checked)} className="h-4 w-4" />
              Use Puppeteer (for JavaScript-rendered sites like Tayara)
            </label>
            <Button onClick={() => createSource.mutate()} disabled={!name || !baseUrl || createSource.isPending}>
              {createSource.isPending ? 'Creating...' : 'Create'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Scraping Sources</CardTitle></CardHeader>
        <CardContent>
          {srcLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : sources && sources.length > 0 ? (
            <div className="space-y-3">
              {sources.map(s => (
                <div key={s.id} className="flex items-center justify-between border p-3 rounded-lg">
                  <div>
                    <p className="font-medium">{s.name} {s.usePuppeteer && <span className="text-xs text-primary ml-1">🐢 Puppeteer</span>}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-md">{s.baseUrl}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${s.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <Button variant="outline" size="sm" className="gap-1"
                      onClick={() => startJob.mutate(s.id)} disabled={startJob.isPending}>
                      {startJob.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                      Scrape
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteSource.mutate(s.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No sources configured. Add one to start scraping.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Job History</CardTitle></CardHeader>
        <CardContent>
          {jobsLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : jobs && jobs.length > 0 ? (
            <div className="space-y-2">
              {jobs.map(j => (
                <div key={j.id} className="border p-3 rounded-lg text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {statusBadge(j.status)}
                      <span className="font-medium">{j.source.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {j.completedAt ? new Date(j.completedAt).toLocaleString() : j.startedAt ? 'Running...' : 'Pending'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{j.scrapedUrls}/{j.totalUrls} pages</span>
                    <span>{j.propertiesFound} properties found</span>
                    {j.failedUrls > 0 && <span className="text-destructive">{j.failedUrls} failed</span>}
                    {j.status === 'COMPLETED' && j.propertiesFound > 0 && (
                      <Link to={`/properties?scrapedFrom=${j.source.name}`}
                        className="text-primary hover:underline flex items-center gap-1 ml-auto">
                        View Results <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                  {j.error && <p className="text-xs text-destructive mt-1">{j.error}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No jobs yet. Start scraping a source.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
