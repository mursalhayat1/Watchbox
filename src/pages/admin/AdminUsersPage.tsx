import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown, RefreshCw, ShieldBan, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { listUsers, type AdminUser } from '@/lib/supabase/admin';
import { toast } from 'sonner';

const PAGE_SIZE = 25;

function SortBtn({ field, current, dir, onClick }: {
  field: string; current: string; dir: 'asc' | 'desc'; onClick: (f: string) => void;
}) {
  const active = current === field;
  return (
    <button onClick={() => onClick(field)} className="inline-flex flex-col ml-1 opacity-50 hover:opacity-100">
      <ChevronUp   className={`w-2.5 h-2.5 ${active && dir === 'asc'  ? 'text-primary opacity-100' : ''}`} />
      <ChevronDown className={`w-2.5 h-2.5 ${active && dir === 'desc' ? 'text-primary opacity-100' : ''}`} />
    </button>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(0);
  const [search, setSearch]     = useState('');
  const [inputVal, setInputVal] = useState('');
  const [sortBy, setSortBy]     = useState<'created_at' | 'email'>('created_at');
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter]     = useState<'all' | 'admin' | 'suspended'>('all');
  const [loading, setLoading]   = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listUsers(search || undefined, PAGE_SIZE, page * PAGE_SIZE, sortBy, sortDir);
      let rows = result.rows;
      // client-side filter (role/suspended) — server doesn't have this param yet
      if (filter === 'admin')     rows = rows.filter(u => u.role === 'admin');
      if (filter === 'suspended') rows = rows.filter(u => u.is_suspended);
      setUsers(rows);
      setTotal(result.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, page, sortBy, sortDir, filter]);

  useEffect(() => { void load(); }, [load]);

  const handleSearchInput = (v: string) => {
    setInputVal(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(v); setPage(0); }, 350);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field as 'created_at' | 'email'); setSortDir('desc'); }
    setPage(0);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const displayName = (u: AdminUser) => u.full_name || u.display_name || u.username || u.email || u.id.slice(0, 8);
  const initial     = (u: AdminUser) => (displayName(u)).charAt(0).toUpperCase();

  return (
    <AdminLayout title="Users" breadcrumbs={[{ label: 'Users' }]}>
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-0 w-full md:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={inputVal}
            onChange={e => handleSearchInput(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <Select value={filter} onValueChange={v => { setFilter(v as typeof filter); setPage(0); }}>
          <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            <SelectItem value="admin">Admins only</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={() => load()} className="h-8 gap-1.5 text-xs shrink-0">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
        <p className="text-xs text-muted-foreground shrink-0 ml-auto">
          {total.toLocaleString()} total
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    User
                    <SortBtn field="email" current={sortBy} dir={sortDir} onClick={handleSort} />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Role</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Library</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Favorites</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Watchlist</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    Joined
                    <SortBtn field="created_at" current={sortBy} dir={sortDir} onClick={handleSort} />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                  : users.length === 0
                    ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                          No users found
                        </td>
                      </tr>
                    )
                    : users.map(u => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Link to={`/admin/users/${u.id}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                            <Avatar className="w-7 h-7 shrink-0">
                              {(u.avatar_url || u.provider_avatar_url) && (
                                <AvatarImage src={u.avatar_url || u.provider_avatar_url || ''} />
                              )}
                              <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-semibold">
                                {initial(u)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate max-w-[140px]">{displayName(u)}</p>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{u.email}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {u.role === 'admin'
                            ? <Badge className="text-[10px] px-1.5 py-0 bg-primary/20 text-primary border-primary/30">Admin</Badge>
                            : <span className="text-[10px] text-muted-foreground">User</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-xs tabular-nums">{u.library_count}</td>
                        <td className="px-4 py-3 text-right text-xs tabular-nums">{u.favorites_count}</td>
                        <td className="px-4 py-3 text-right text-xs tabular-nums">{u.watchlist_count}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {u.is_suspended
                            ? <span className="flex items-center gap-1 text-[10px] text-destructive"><ShieldBan className="w-3 h-3" /> Suspended</span>
                            : <span className="flex items-center gap-1 text-[10px] text-chart-3"><ShieldCheck className="w-3 h-3" /> Active</span>}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0} className="h-7 text-xs">
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="h-7 text-xs">
              Next
            </Button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
