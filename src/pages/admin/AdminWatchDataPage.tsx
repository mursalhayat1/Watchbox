import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import { getWatchData, type WatchDataRow } from '@/lib/supabase/admin';
import { tmdbImageUrl } from '@/services/tmdb';
import { toast } from 'sonner';

const PAGE_SIZE = 25;
type TableKey = 'library_items' | 'favorite_items' | 'watchlist_items';

const TAB_LABELS: Record<TableKey, string> = {
  library_items:   'Library',
  favorite_items:  'Favorites',
  watchlist_items: 'Watchlist',
};

const STATUS_COLORS: Record<string, string> = {
  'Watching':      'bg-primary/20 text-primary border-primary/30',
  'Completed':     'bg-chart-3/20 text-chart-3 border-chart-3/30',
  'Plan to Watch': 'bg-muted text-muted-foreground',
  'On Hold':       'bg-accent/20 text-accent border-accent/30',
  'Dropped':       'bg-destructive/20 text-destructive border-destructive/30',
};

export default function AdminWatchDataPage() {
  const [tab, setTab]               = useState<TableKey>('library_items');
  const [rows, setRows]             = useState<WatchDataRow[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(0);
  const [search, setSearch]         = useState('');
  const [inputVal, setInputVal]     = useState('');
  const [loading, setLoading]       = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getWatchData(tab, search || undefined, PAGE_SIZE, page * PAGE_SIZE);
      setRows(result.rows ?? []);
      setTotal(result.total);
    } catch {
      toast.error('Failed to load watch data');
    } finally {
      setLoading(false);
    }
  }, [tab, search, page]);

  useEffect(() => { void load(); }, [load]);

  const handleSearch = (v: string) => {
    setInputVal(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(v); setPage(0); }, 350);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout title="Watch Data" breadcrumbs={[{ label: 'Watch Data' }]}>
      {/* Tabs + Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-5">
        <Tabs value={tab} onValueChange={v => { setTab(v as TableKey); setPage(0); setSearch(''); setInputVal(''); }}>
          <TabsList className="h-8">
            {(Object.keys(TAB_LABELS) as TableKey[]).map(k => (
              <TabsTrigger key={k} value={k} className="text-xs">{TAB_LABELS[k]}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative flex-1 min-w-0 w-full md:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Filter by title or email…" value={inputVal} onChange={e => handleSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <Button variant="ghost" size="sm" onClick={() => load()} className="h-8 gap-1.5 text-xs shrink-0">
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
        <p className="text-xs text-muted-foreground shrink-0 ml-auto">{total.toLocaleString()} rows</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Type</th>
                  {tab === 'library_items' && (
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Status</th>
                  )}
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Rating</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Added</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: tab === 'library_items' ? 6 : 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                  : rows.length === 0
                    ? (
                      <tr>
                        <td colSpan={tab === 'library_items' ? 6 : 5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                          No data found
                        </td>
                      </tr>
                    )
                    : rows.map(row => (
                      <tr key={row.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link to={`/detail/${row.media_type}/${row.tmdb_id}`} className="flex items-center gap-2.5 hover:opacity-80" target="_blank" rel="noopener noreferrer">
                            {row.poster_path && (
                              <img src={tmdbImageUrl(row.poster_path, 'w45') ?? ''} alt={row.title} className="w-7 h-10 rounded object-cover shrink-0" />
                            )}
                            <span className="text-xs font-medium max-w-[160px] truncate">{row.title}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link to={`/admin/users/${row.user_id}`} className="hover:text-primary transition-colors">
                            <p className="text-xs truncate max-w-[120px]">{row.user_name || row.user_email || row.user_id.slice(0, 8)}</p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">{row.user_email}</p>
                          </Link>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge variant="secondary" className="text-[10px] capitalize">{row.media_type}</Badge>
                        </td>
                        {tab === 'library_items' && (
                          <td className="px-4 py-3 whitespace-nowrap">
                            {row.status && (
                              <Badge className={`text-[10px] border ${STATUS_COLORS[row.status] ?? 'bg-muted text-muted-foreground'}`}>
                                {row.status}
                              </Badge>
                            )}
                          </td>
                        )}
                        <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">
                          {row.vote_average?.toFixed(1) ?? '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(row.added_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0} className="h-7 text-xs">Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="h-7 text-xs">Next</Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
