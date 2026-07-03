import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { Play, Plus, Trash2, Loader2, ExternalLink, Clock, RefreshCw } from 'lucide-react';

interface Source {
  id: number;
  name: string;
  baseUrl: string;
  selectors: Record<string, string>;
  isActive: boolean;
  usePuppeteer: boolean;
  maxPages: number;
  pageUrlPattern: string | null;
  nextPageSelector: string | null;
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
  const [maxPages, setMaxPages] = useState(1);
  const [pageUrlPattern, setPageUrlPattern] = useState('');
  const [nextPageSelector, setNextPageSelector] = useState('');

  const { data: sources, isLoading: srcLoading } = useQuery<Source[]>({
    queryKey: ['scraping-sources'],
    queryFn: () => api.get('/scraping/sources').then(r => r.data),
  });

  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ['scraping-jobs'],
    queryFn: () => api.get('/scraping/jobs').then(r => r.data),
  });

  const createSource = useMutation({
    mutationFn: () => api.post('/scraping/sources', { name, baseUrl, selectors: defaultSelectors, usePuppeteer, maxPages, pageUrlPattern: pageUrlPattern || undefined, nextPageSelector: nextPageSelector || undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['scraping-sources'] }); setShowForm(false); setName(''); setBaseUrl(''); setUsePuppeteer(false); setMaxPages(1); setPageUrlPattern(''); setNextPageSelector(''); },
  });

  const deleteSource = useMutation({
    mutationFn: (id: number) => api.delete(`/scraping/sources/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scraping-sources'] }),
  });

  const [elapsed, setElapsed] = useState(0);
  const [runningJobId, setRunningJobId] = useState<number | null>(null);

  const activeJob = jobs?.find(j => j.status === 'RUNNING' || j.status === 'PENDING');

  useEffect(() => {
    if (activeJob) {
      setRunningJobId(activeJob.id);
      const start = activeJob.startedAt ? new Date(activeJob.startedAt).getTime() : Date.now();
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setRunningJobId(null);
    }
  }, [activeJob?.id, activeJob?.status, activeJob?.startedAt]);

  const startJob = useMutation({
    mutationFn: (sourceId: number) => api.post(`/scraping/jobs/${sourceId}/start`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] });
    },
  });

  useEffect(() => {
    if (runningJobId) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['scraping-jobs'] });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [runningJobId, queryClient]);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Scraping Dashboard</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Add Source
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Scraping Source</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Source Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tayara" />
            <Input label="Base URL" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://www.tayara.tn/immobilier" />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={usePuppeteer} onChange={e => setUsePuppeteer(e.target.checked)}
                className="h-4 w-4 rounded-sm border-hairline text-primary focus-visible:outline-none focus-visible:border-foreground" />
              Use Puppeteer (for JavaScript-rendered sites like Tayara)
            </label>
            <Input label="Max Pages" type="number" min={1} value={maxPages} onChange={e => setMaxPages(parseInt(e.target.value) || 1)} />
            <Input label="Page URL Pattern" value={pageUrlPattern} onChange={e => setPageUrlPattern(e.target.value)} placeholder="?page={page}" />
            <Input label="Next Page Selector" value={nextPageSelector} onChange={e => setNextPageSelector(e.target.value)} placeholder=".pagination .next a" />
            <Button onClick={() => createSource.mutate()} disabled={!name || !baseUrl || createSource.isPending}>
              {createSource.isPending ? 'Creating...' : 'Create Source'}
            </Button>
          </CardContent>
        </Card>
      )}

      {srcLoading ? (
        <p className="text-muted-foreground">Loading sources...</p>
      ) : sources && sources.length > 0 ? (
        <div className="space-y-3">
          {sources.map(s => (
            <div key={s.id} className="rounded-md border bg-card p-4 flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-medium text-sm">{s.name} {s.usePuppeteer && <span className="text-xs text-primary ml-1">Puppeteer</span>}</p>
                <p className="text-xs text-muted-foreground truncate max-w-md mt-0.5">{s.baseUrl}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`h-2 w-2 rounded-full ${s.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                <Button variant="outline" size="sm"
                  onClick={() => startJob.mutate(s.id)} disabled={startJob.isPending}>
                  {startJob.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                  Scrape
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSource.mutate(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No sources configured. Add one to start scraping.</p>
      )}

      {activeJob && (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Scraping {activeJob.source.name}...</p>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatElapsed(elapsed)}</span>
                <span><RefreshCw className="h-3 w-3 inline mr-0.5" /> {activeJob.propertiesFound} properties found so far</span>
                {activeJob.scrapedUrls > 0 && <span>{activeJob.scrapedUrls}/{activeJob.totalUrls} pages</span>}
              </div>
            </div>
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Job History</CardTitle></CardHeader>
        <CardContent>
          {jobsLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : jobs && jobs.length > 0 ? (
            <div className="space-y-2">
              {jobs.map(j => (
                <div key={j.id} className="rounded-md border bg-card p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {statusBadge(j.status)}
                      <span className="font-medium">{j.source.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {j.completedAt ? new Date(j.completedAt).toLocaleString() : j.status === 'RUNNING' ? (
                        <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Running...</span>
                      ) : 'Pending'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
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
                  {j.error && <p className="text-xs text-destructive mt-1.5">{j.error}</p>}
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
