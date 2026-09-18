import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageMeta from '@/components/common/PageMeta';
import { noindexMetadata } from '@/lib/seo';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  UserCircle2, LogOut, Film, Tv, Star,
  BookOpen, Eye, CheckCircle2, Clock3, PauseCircle, XCircle,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import { useAuth, getDisplayName, getAvatarUrl, getAuthProvider } from '@/contexts/AuthContext';
import { useLibrary } from '@/hooks/useLibrary';
import { tmdbImageUrl } from '@/services/tmdb';
import type { LibraryItem } from '@/lib/libraryApi';

// ── colour palette ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  'Watching':      '#3b82f6',
  'Completed':     '#22c55e',
  'Plan to Watch': '#a855f7',
  'On Hold':       '#f59e0b',
  'Dropped':       '#ef4444',
};
const STATUS_ICONS: Record<string, React.ElementType> = {
  'Watching':      Eye,
  'Completed':     CheckCircle2,
  'Plan to Watch': Clock3,
  'On Hold':       PauseCircle,
  'Dropped':       XCircle,
};
const CHART_COLORS = ['#06b6d4','#3b82f6','#a855f7','#f59e0b','#22c55e','#ef4444','#ec4899','#10b981'];

// ── sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number | string;
  icon: React.ElementType; color?: string;
}) {
  return (
    <div className="rounded-2xl p-4 flex flex-col items-center gap-2"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: color ? `${color}22` : 'rgba(255,255,255,0.07)' }}>
        <Icon className="w-5 h-5" style={{ color: color ?? 'rgba(255,255,255,0.6)' }} />
      </div>
      <p className="text-white/45 text-[10px] uppercase tracking-widest font-medium">{label}</p>
      <p className="text-white text-2xl font-bold leading-none">{value}</p>
    </div>
  );
}

// ── activity heatmap (past 12 months) ─────────────────────────────────────────
function ActivityHeatmap({ items }: { items: LibraryItem[] }) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(today.getFullYear() - 1);

  const completionDates = useMemo(() => {
    const map: Record<string, number> = {};
    items.filter(it => it.status === 'Completed').forEach(it => {
      const d = it.updated_at?.slice(0, 10) ?? it.added_at?.slice(0, 10);
      if (d) map[d] = (map[d] ?? 0) + 1;
    });
    return map;
  }, [items]);

  // Build a 53×7 grid (ISO weeks × days)
  const weeks = useMemo(() => {
    const result: { date: string; count: number }[][] = [];
    const cur = new Date(startDate);
    // align to Monday
    while (cur.getDay() !== 1) cur.setDate(cur.getDate() - 1);
    while (cur <= today) {
      const week: { date: string; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const ds = cur.toISOString().slice(0, 10);
        week.push({ date: ds, count: completionDates[ds] ?? 0 });
        cur.setDate(cur.getDate() + 1);
      }
      result.push(week);
    }
    return result;
  }, [completionDates]); // eslint-disable-line

  const cellColor = (count: number) => {
    if (count === 0) return 'rgba(255,255,255,0.06)';
    if (count === 1) return 'rgba(34,197,94,0.35)';
    if (count === 2) return 'rgba(34,197,94,0.60)';
    if (count >= 3)  return 'rgba(34,197,94,0.90)';
    return 'rgba(255,255,255,0.06)';
  };

  return (
    <div className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Completion Activity</h3>
        <span className="text-xs text-white/35">Past 12 months</span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-[3px] min-w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map(({ date, count }) => (
                <div key={date} title={count > 0 ? `${date}: ${count} completed` : date}
                  className="w-[11px] h-[11px] rounded-[2px] cursor-default"
                  style={{ background: cellColor(count) }} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] text-white/30">Less</span>
        {[0, 1, 2, 3].map(n => (
          <div key={n} className="w-[11px] h-[11px] rounded-[2px]" style={{ background: cellColor(n) }} />
        ))}
        <span className="text-[10px] text-white/30">More</span>
      </div>
    </div>
  );
}

// ── top-rated list ─────────────────────────────────────────────────────────────
function TopRatedList({ items }: { items: LibraryItem[] }) {
  const sorted = useMemo(() =>
    [...items].sort((a, b) => b.vote_average - a.vote_average).slice(0, 6),
    [items]);

  if (!sorted.length) return null;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold text-white">Top Rated</h3>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {sorted.map(item => (
          <Link key={item.id} to={`/detail/${item.media_type}/${item.tmdb_id}`}
            className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.04] transition-colors">
            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-white/8">
              {item.poster_path
                ? <img src={tmdbImageUrl(item.poster_path, 'w92') ?? ''} alt={item.title}
                    className="w-full h-full object-cover" />
                : <Film className="w-4 h-4 m-auto mt-2.5 text-white/25" />}
            </div>
            <span className="flex-1 min-w-0 text-sm text-white/85 truncate">{item.title}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="h-1 w-24 rounded-full overflow-hidden bg-white/10">
                <div className="h-full rounded-full bg-white/50"
                  style={{ width: `${(item.vote_average / 10) * 100}%` }} />
              </div>
              <span className="text-xs text-white/60 w-5 text-right">{item.vote_average.toFixed(0)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function StatsPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { items, loading } = useLibrary();

  const provider    = getAuthProvider(user);
  // For OAuth users, prefer the name stored in user_metadata by Supabase
  // (full_name from Google / username from Discord) before falling back to profile.
  const providerName = user?.user_metadata?.full_name as string | undefined
    ?? user?.user_metadata?.name as string | undefined
    ?? user?.user_metadata?.global_name as string | undefined; // Discord global name
  const displayName = providerName || getDisplayName(profile);
  const avatarUrl   = getAvatarUrl(profile);

  // ── computed stats ──────────────────────────────────────────────────────────
  const total      = items.length;
  const byStatus   = useMemo(() => {
    const m: Record<string, number> = {};
    items.forEach(it => { m[it.status] = (m[it.status] ?? 0) + 1; });
    return m;
  }, [items]);

  const genreMap = useMemo(() => {
    // We don't store genres on library items; use title as proxy label for now.
    // If TMDB genre data is added to library rows later this will auto-populate.
    return {} as Record<string, number>;
  }, []);
  const _ = genreMap; // suppress unused warning

  const ratingBuckets = useMemo(() => {
    const buckets: Record<string, number> = {
      '1-2': 0, '3-4': 0, '5-6': 0, '7-8': 0, '9-10': 0,
    };
    items.forEach(it => {
      const v = it.vote_average;
      if (v <= 2)       buckets['1-2']++;
      else if (v <= 4)  buckets['3-4']++;
      else if (v <= 6)  buckets['5-6']++;
      else if (v <= 8)  buckets['7-8']++;
      else              buckets['9-10']++;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [items]);

  const pieData = useMemo(() =>
    Object.entries(byStatus).map(([name, value]) => ({ name, value })),
    [byStatus]);

  const movieCount = items.filter(i => i.media_type === 'movie').length;
  const tvCount    = items.filter(i => i.media_type === 'tv').length;

  // Sign-in prompt
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen" style={{ background: 'hsl(191,60%,5%)' }}>
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 pt-24 px-4">
          <UserCircle2 className="w-16 h-16 text-white/20" />
          <h1 className="text-xl font-bold text-white">Sign in to view your stats</h1>
          <p className="text-white/45 text-sm text-center max-w-xs">
            Track your watch history, genre preferences, and more.
          </p>
          <Link to="/login"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,hsl(189,70%,32%),hsl(189,80%,22%))' }}>
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'hsl(191,60%,5%)' }}>
      <PageMeta seo={noindexMetadata('My Stats', '/stats')} />
      <Navbar />

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 md:px-8 pt-24 pb-20 md:pb-16">

        {/* ── Profile header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0"
              style={{ border: '2px solid rgba(255,255,255,0.15)' }}>
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                : <UserCircle2 className="w-full h-full text-white/30 p-2" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-white">{displayName}</h1>
                {provider !== 'email' && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      background: provider === 'google' ? 'rgba(234,67,53,0.18)' : 'rgba(88,101,242,0.22)',
                      color:      provider === 'google' ? '#ea4335'               : '#7289da',
                      border:     `1px solid ${provider === 'google' ? 'rgba(234,67,53,0.35)' : 'rgba(88,101,242,0.40)'}`,
                    }}>
                    {provider}
                  </span>
                )}
              </div>
              <p className="text-white/40 text-sm">{profile?.email ?? ''}</p>
            </div>
          </div>
          <button onClick={async () => {
            await signOut();
            toast.success('Signed out');
            navigate('/');
          }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* ── Section heading ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Stats &amp; Insights</h2>
        </div>

        {/* ── Summary stat cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          <StatCard label="Total"          value={total}                          icon={BookOpen}     color="#06b6d4" />
          <StatCard label="Watching"       value={byStatus['Watching'] ?? 0}      icon={Eye}          color="#3b82f6" />
          <StatCard label="Completed"      value={byStatus['Completed'] ?? 0}     icon={CheckCircle2} color="#22c55e" />
          <StatCard label="Plan to Watch"  value={byStatus['Plan to Watch'] ?? 0} icon={Clock3}       color="#a855f7" />
          <StatCard label="On Hold"        value={byStatus['On Hold'] ?? 0}       icon={PauseCircle}  color="#f59e0b" />
          <StatCard label="Dropped"        value={byStatus['Dropped'] ?? 0}       icon={XCircle}      color="#ef4444" />
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          </div>
        )}

        {!loading && total === 0 && (
          <div className="text-center py-20 text-white/35">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-base font-medium">Your library is empty</p>
            <p className="text-sm mt-1">Start adding movies &amp; shows to see your stats here.</p>
          </div>
        )}

        {!loading && total > 0 && (
          <>
            {/* ── Movies vs TV + Rating Distribution ──────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              {/* Media type breakdown */}
              <div className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-sm font-semibold text-white mb-4">Media Type</h3>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-1">
                    <Film className="w-8 h-8 text-cyan-400" />
                    <span className="text-2xl font-bold text-white">{movieCount}</span>
                    <span className="text-xs text-white/40">Movies</span>
                  </div>
                  <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/8">
                    <div className="h-full bg-cyan-500 rounded-full transition-all"
                      style={{ width: total > 0 ? `${(movieCount / total) * 100}%` : '0%' }} />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Tv className="w-8 h-8 text-purple-400" />
                    <span className="text-2xl font-bold text-white">{tvCount}</span>
                    <span className="text-xs text-white/40">TV Shows</span>
                  </div>
                </div>
              </div>

              {/* Rating distribution */}
              <div className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-sm font-semibold text-white mb-4">Rating Distribution</h3>
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart data={ratingBuckets} barSize={28}>
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.40)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: 'rgba(10,20,24,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 12 }}
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="value" radius={[4,4,0,0]}>
                      {ratingBuckets.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Library status donut + Top Rated ────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

              {/* Status donut */}
              <div className="rounded-2xl p-5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-sm font-semibold text-white mb-2">Library Status</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={76}
                      dataKey="value" paddingAngle={3}>
                      {pieData.map(({ name }, i) => (
                        <Cell key={i} fill={STATUS_COLORS[name] ?? CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'rgba(10,20,24,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: 12 }}
                      formatter={(value, name) => [value, name]} />
                    <Legend
                      iconType="circle" iconSize={8}
                      formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top rated */}
              <div className="md:col-span-2">
                <TopRatedList items={items} />
              </div>
            </div>

            {/* ── Status breakdown row ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {Object.entries(STATUS_COLORS).map(([status, color]) => {
                const Icon = STATUS_ICONS[status] ?? BookOpen;
                const count = byStatus[status] ?? 0;
                return (
                  <div key={status} className="rounded-2xl p-4 flex items-center gap-3"
                    style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}30` }}>
                    <Icon className="w-5 h-5 shrink-0" style={{ color }} />
                    <div className="min-w-0">
                      <p className="text-white text-lg font-bold leading-none">{count}</p>
                      <p className="text-[11px] text-white/40 truncate mt-0.5">{status}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Activity heatmap ─────────────────────────────────────────── */}
            <div className="mb-4">
              <ActivityHeatmap items={items} />
            </div>


          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
