import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Film, BookOpen, Heart, List, Activity,
  TrendingUp, Eye, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  getAdminStats, getUserGrowth, getActivity, getTopTitles,
  getMediaDistribution, getStatusDistribution,
  type AdminStats, type UserGrowthRow, type ActivityRow, type TopTitle,
} from '@/lib/supabase/admin';
import { tmdbImageUrl } from '@/services/tmdb';
import { toast } from 'sonner';

// ── Time range ────────────────────────────────────────────────────────────────
const TIME_RANGES = [
  { label: 'Today',    days: 1 },
  { label: '7 days',   days: 7 },
  { label: '30 days',  days: 30 },
  { label: '90 days',  days: 90 },
  { label: 'All time', days: undefined },
] as const;
type TimeRange = (typeof TIME_RANGES)[number];

// ── Stat card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number | undefined;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  href?: string;
  badge?: string;
  color?: string;
}

function StatCard({ title, value, icon: Icon, loading, href, badge, color = 'text-primary' }: StatCardProps) {
  const inner = (
    <Card className="hover:border-primary/40 transition-colors group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
            {loading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {(value ?? 0).toLocaleString()}
              </p>
            )}
          </div>
          <div className={`w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
        </div>
        {badge && (
          <Badge variant="secondary" className="mt-2 text-[10px]">{badge}</Badge>
        )}
      </CardContent>
    </Card>
  );
  return href ? <Link to={href}>{inner}</Link> : inner;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
const CHART_COLORS = ['hsl(210,80%,52%)', 'hsl(38,75%,52%)', 'hsl(160,60%,45%)', 'hsl(280,60%,55%)', 'hsl(0,65%,55%)'];

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>(TIME_RANGES[2]);
  const [stats, setStats]               = useState<AdminStats | null>(null);
  const [growth, setGrowth]             = useState<UserGrowthRow[]>([]);
  const [activity, setActivity]         = useState<ActivityRow[]>([]);
  const [topTitles, setTopTitles]       = useState<TopTitle[]>([]);
  const [mediaDistrib, setMediaDistrib] = useState<{ name: string; value: number }[]>([]);
  const [statusDistrib, setStatusDistrib] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);

  const loadAll = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [s, g, a, tt, md, sd] = await Promise.all([
        getAdminStats(timeRange.days),
        getUserGrowth(timeRange.days ?? 90),
        getActivity(timeRange.days ?? 30),
        getTopTitles(8),
        getMediaDistribution(),
        getStatusDistribution(),
      ]);
      setStats(s);
      setGrowth(g);
      setActivity(a);
      setTopTitles(tt);
      setMediaDistrib(md.map(r => ({ name: r.media_type === 'movie' ? 'Movies' : 'TV Shows', value: Number(r.cnt) })));
      setStatusDistrib(sd.map(r => ({ name: r.status, value: Number(r.cnt) })));
    } catch (e) {
      toast.error('Failed to load dashboard data');
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => { void loadAll(); }, [loadAll]);

  const growthData  = growth.map(r => ({ date: r.day.slice(5), new: Number(r.new_users), total: Number(r.cumulative_users) }));
  const activityData = activity.map(r => ({ date: r.day.slice(5), library: Number(r.library_adds), favorites: Number(r.favorites_adds), watchlist: Number(r.watchlist_adds) }));

  return (
    <AdminLayout
      title="Dashboard"
      breadcrumbs={[{ label: 'Dashboard' }]}
      actions={
        <Button variant="ghost" size="sm" onClick={() => loadAll(true)} disabled={refreshing} className="gap-1.5 text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      {/* Time range selector */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <p className="text-sm text-muted-foreground">Showing data for</p>
        <Select
          value={String(timeRange.days ?? 'all')}
          onValueChange={v => setTimeRange(TIME_RANGES.find(r => String(r.days ?? 'all') === v) ?? TIME_RANGES[2])}
        >
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_RANGES.map(r => (
              <SelectItem key={String(r.days ?? 'all')} value={String(r.days ?? 'all')}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard title="Total Users"          value={stats?.total_users}                loading={loading} icon={Users}     href="/admin/users"    color="text-primary" />
        <StatCard title="New Users"            value={stats?.new_users}                  loading={loading} icon={TrendingUp} color="text-chart-3" />
        <StatCard title="Library Items"        value={stats?.total_library_items}        loading={loading} icon={BookOpen}   href="/admin/watch-data" color="text-chart-2" />
        <StatCard title="New Library Items"    value={stats?.new_library_items}          loading={loading} icon={TrendingUp} color="text-chart-3" />
        <StatCard title="Favorites"            value={stats?.total_favorites}            loading={loading} icon={Heart}      color="text-chart-5" />
        <StatCard title="Watchlist Items"      value={stats?.total_watchlist_items}      loading={loading} icon={List}       color="text-chart-4" />
        <StatCard title="Episode Progress"     value={stats?.total_episode_progress}     loading={loading} icon={Film}       color="text-chart-1" />
        <StatCard title="Currently Watching"   value={stats?.currently_watching_users}   loading={loading} icon={Eye}        color="text-accent" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* User growth */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">User Growth</CardTitle>
            <CardDescription className="text-xs">New & cumulative signups</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? <Skeleton className="h-48 w-full" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="total" stroke={CHART_COLORS[0]} fill="url(#gTotal)" strokeWidth={2} name="Total" />
                  <Area type="monotone" dataKey="new"   stroke={CHART_COLORS[2]} fill="none"         strokeWidth={2} strokeDasharray="4 2" name="New" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Watch Activity</CardTitle>
            <CardDescription className="text-xs">Daily library / favorites / watchlist adds</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? <Skeleton className="h-48 w-full" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={activityData} barSize={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="library"   fill={CHART_COLORS[0]} name="Library"   radius={[2,2,0,0]} />
                  <Bar dataKey="favorites" fill={CHART_COLORS[1]} name="Favorites" radius={[2,2,0,0]} />
                  <Bar dataKey="watchlist" fill={CHART_COLORS[2]} name="Watchlist" radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Media distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Media Type</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? <Skeleton className="h-40 w-full" /> : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={mediaDistrib} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 10 }}>
                    {mediaDistrib.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Library status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Library Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? <Skeleton className="h-40 w-full" /> : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={statusDistrib} layout="vertical" barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} width={80} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" name="Items" radius={[0,2,2,0]}>
                    {statusDistrib.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top titles */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top Saved Titles</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-2">{Array.from({length: 5}).map((_,i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : (
              <div className="space-y-1">
                {topTitles.slice(0, 6).map((t, i) => (
                  <div key={t.tmdb_id} className="flex items-center gap-2 py-1">
                    <span className="w-4 text-[10px] text-muted-foreground tabular-nums">{i + 1}</span>
                    {t.poster_path && (
                      <img src={tmdbImageUrl(t.poster_path, 'w45') ?? ''} alt={t.title} className="w-6 h-8 rounded object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{t.title}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{t.media_type}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">{t.save_count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Manage Users',    href: '/admin/users',      icon: Users },
          { label: 'Watch Data',      href: '/admin/watch-data', icon: BookOpen },
          { label: 'Analytics',       href: '/admin/analytics',  icon: Activity },
          { label: 'Audit Logs',      href: '/admin/logs',       icon: FileText },
        ].map(({ label, href, icon: Icon }) => (
          <Link key={href} to={href}>
            <Card className="hover:border-primary/40 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium truncate">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function FileText({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  );
}
