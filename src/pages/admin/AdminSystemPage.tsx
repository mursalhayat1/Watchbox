import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/lib/supabase/client';

interface ServiceStatus {
  name: string;
  status: 'ok' | 'error' | 'checking';
  latency: number | null;
  lastChecked: Date | null;
  detail?: string;
}

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY as string;

async function checkService(name: string, checkFn: () => Promise<void>): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await checkFn();
    return { name, status: 'ok', latency: Date.now() - start, lastChecked: new Date() };
  } catch (e) {
    return { name, status: 'error', latency: Date.now() - start, lastChecked: new Date(), detail: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export default function AdminSystemPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Supabase Database', status: 'checking', latency: null, lastChecked: null },
    { name: 'Supabase Auth',     status: 'checking', latency: null, lastChecked: null },
    { name: 'TMDB API',          status: 'checking', latency: null, lastChecked: null },
  ]);
  const [loading, setLoading] = useState(true);

  const runChecks = useCallback(async () => {
    setLoading(true);
    setServices(prev => prev.map(s => ({ ...s, status: 'checking' as const })));

    const results = await Promise.all([
      checkService('Supabase Database', async () => {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (error) throw error;
      }),
      checkService('Supabase Auth', async () => {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
      }),
      checkService('TMDB API', async () => {
        const res = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${TMDB_API_KEY}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }),
    ]);

    setServices(results);
    setLoading(false);
  }, []);

  useEffect(() => { void runChecks(); }, [runChecks]);

  const allOk = services.every(s => s.status === 'ok');
  const anyError = services.some(s => s.status === 'error');

  return (
    <AdminLayout
      title="System Health"
      breadcrumbs={[{ label: 'System' }]}
      actions={
        <Button variant="ghost" size="sm" onClick={runChecks} disabled={loading} className="gap-1.5 text-xs h-8">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Re-check
        </Button>
      }
    >
      {/* Overall status */}
      <div className="mb-6">
        {loading ? (
          <Skeleton className="h-12 w-full rounded-xl" />
        ) : allOk ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-chart-3/10 border border-chart-3/30">
            <CheckCircle2 className="w-5 h-5 text-chart-3 shrink-0" />
            <p className="text-sm font-medium text-chart-3">All systems operational</p>
          </div>
        ) : anyError ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30">
            <XCircle className="w-5 h-5 text-destructive shrink-0" />
            <p className="text-sm font-medium text-destructive">One or more services are degraded</p>
          </div>
        ) : null}
      </div>

      {/* Service cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {services.map(svc => (
          <Card key={svc.name}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-sm font-semibold">{svc.name}</p>
                {svc.status === 'checking' ? (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin shrink-0" />
                ) : svc.status === 'ok' ? (
                  <CheckCircle2 className="w-4 h-4 text-chart-3 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  {svc.status === 'checking' ? (
                    <Badge variant="secondary" className="text-[10px]">Checking…</Badge>
                  ) : svc.status === 'ok' ? (
                    <Badge className="text-[10px] bg-chart-3/20 text-chart-3 border-chart-3/30">Operational</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px]">Error</Badge>
                  )}
                </div>
                {svc.latency !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Latency</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className={`text-xs tabular-nums ${svc.latency > 1000 ? 'text-accent' : 'text-foreground'}`}>
                        {svc.latency}ms
                      </span>
                    </div>
                  </div>
                )}
                {svc.lastChecked && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Checked</span>
                    <span className="text-xs text-muted-foreground">{svc.lastChecked.toLocaleTimeString()}</span>
                  </div>
                )}
                {svc.detail && (
                  <p className="text-[10px] text-destructive mt-1 break-words">{svc.detail}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Environment info (no secrets) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Environment</CardTitle>
          <CardDescription className="text-xs">Non-sensitive runtime configuration</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm">
            {[
              { label: 'App ID',          value: import.meta.env.VITE_APP_ID ?? '—' },
              { label: 'Supabase URL',    value: (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/^https?:\/\//, '').slice(0, 32) + '…' || '—' },
              { label: 'TMDB API',        value: TMDB_API_KEY ? '✓ Configured' : '✗ Missing' },
              { label: 'Site URL',        value: import.meta.env.VITE_SITE_URL ?? window.location.origin },
              { label: 'Build mode',      value: import.meta.env.MODE },
              { label: 'React version',   value: '18.x' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-xs font-mono text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
