import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  getUserGrowth, getActivity, getTopTitles, getStatusDistribution, getMediaDistribution,
  type UserGrowthRow, type ActivityRow, type TopTitle,
} from '@/lib/supabase/admin';
import { tmdbImageUrl } from '@/services/tmdb';
import { toast } from 'sonner';

const COLORS = ['hsl(210,80%,52%)', 'hsl(38,75%,52%)', 'hsl(160,60%,45%)', 'hsl(280,60%,55%)', 'hsl(0,65%,55%)'];

export default function AdminAnalyticsPage() {
  const [days, setDays]                   = useState(30);
  const [growth, setGrowth]               = useState<UserGrowthRow[]>([]);
  const [activity, setActivity]           = useState<ActivityRow[]>([]);
  const [topMovies, setTopMovies]         = useState<TopTitle[]>([]);
  const [topTV, setTopTV]                 = useState<TopTitle[]>([]);
  const [statusData, setStatusData]       = useState<{name:string;value:number}[]>([]);
  const [mediaData, setMediaData]         = useState<{name:string;value:number}[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [g, a, tm, ttv, sd, md] = await Promise.all([
        getUserGrowth(days),
        getActivity(days),
        getTopTitles(10, 'movie'),
        getTopTitles(10, 'tv'),
        getStatusDistribution(),
        getMediaDistribution(),
      ]);
      setGrowth(g);
      setActivity(a);
      setTopMovies(tm);
      setTopTV(ttv);
      setStatusData(sd.map(r => ({ name: r.status, value: Number(r.cnt) })));
      setMediaData(md.map(r => ({ name: r.media_type === 'movie' ? 'Movies' : 'TV Shows', value: Number(r.cnt) })));
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [days]);

  useEffect(() => { void load(); }, [load]);

  const growthData   = growth.map(r => ({ date: r.day.slice(5), new: Number(r.new_users), total: Number(r.cumulative_users) }));
  const activityData = activity.map(r => ({ date: r.day.slice(5), library: Number(r.library_adds), favorites: Number(r.favorites_adds), watchlist: Number(r.watchlist_adds) }));

  return (
    <AdminLayout
      title="Analytics"
      breadcrumbs={[{ label: 'Analytics' }]}
      actions={
        <div className="flex items-center gap-2">
          <Select value={String(days)} onValueChange={v => setDays(Number(v))}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => load(true)} disabled={refreshing} className="h-8 gap-1.5 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* User growth */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">User Growth</CardTitle>
            <CardDescription className="text-xs">Daily new signups and cumulative total</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="total" stroke={COLORS[0]} strokeWidth={2} dot={false} name="Total Users" />
                  <Line type="monotone" dataKey="new"   stroke={COLORS[2]} strokeWidth={2} dot={false} strokeDasharray="4 2" name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Daily Watch Activity</CardTitle>
            <CardDescription className="text-xs">Items added to library, favorites, and watchlist per day</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? <Skeleton className="h-52 w-full" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={activityData}>
                  <defs>
                    {['lib','fav','wl'].map((k, i) => (
                      <linearGradient key={k} id={`g${k}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={COLORS[i]} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0}   />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="library"   stroke={COLORS[0]} fill="url(#glib)" strokeWidth={2} name="Library" />
                  <Area type="monotone" dataKey="favorites" stroke={COLORS[1]} fill="url(#gfav)" strokeWidth={2} name="Favorites" />
                  <Area type="monotone" dataKey="watchlist" stroke={COLORS[2]} fill="url(#gwl)"  strokeWidth={2} name="Watchlist" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top titles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Top Movies', items: topMovies, type: 'movie' as const },
            { label: 'Top TV Shows', items: topTV, type: 'tv' as const },
          ].map(({ label, items, type }) => (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{label}</CardTitle>
                <CardDescription className="text-xs">Most saved by users</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {loading ? (
                  <div className="space-y-2">{Array.from({length:5}).map((_,i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                ) : items.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No data</p>
                ) : (
                  <div className="space-y-1">
                    {items.map((t, i) => (
                      <Link key={t.tmdb_id} to={`/detail/${type}/${t.tmdb_id}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <span className="w-5 text-[11px] text-muted-foreground tabular-nums text-center">{i + 1}</span>
                        {t.poster_path && (
                          <img src={tmdbImageUrl(t.poster_path, 'w45') ?? ''} alt={t.title} className="w-7 h-10 rounded object-cover shrink-0" />
                        )}
                        <p className="flex-1 text-xs font-medium truncate">{t.title}</p>
                        <Badge variant="secondary" className="text-[10px] shrink-0">{t.save_count} saves</Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Status + media distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Library Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? <Skeleton className="h-48 w-full" /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statusData} layout="vertical" barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} width={85} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" name="Items" radius={[0,2,2,0]}>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Content Type Split</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? <Skeleton className="h-48 w-full" /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mediaData} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" name="Items" radius={[4,4,0,0]}>
                      {mediaData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
