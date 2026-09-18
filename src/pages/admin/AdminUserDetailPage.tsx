import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Heart, ShieldBan, ShieldCheck,
  Shield, Trash2, RefreshCw, User2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  getUserDetails, updateUser, deleteUser, logAdminAction,
  getUserLibrary, getUserFavorites,
  type AdminUserDetails,
} from '@/lib/supabase/admin';
import { tmdbImageUrl } from '@/services/tmdb';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center px-4 py-3 bg-muted/40 rounded-lg">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [details, setDetails]   = useState<AdminUserDetails | null>(null);
  const [library, setLibrary]   = useState<Awaited<ReturnType<typeof getUserLibrary>>>([]);
  const [favs, setFavs]         = useState<Awaited<ReturnType<typeof getUserFavorites>>>([]);
  const [loading, setLoading]   = useState(true);
  const [actioning, setActioning] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [d, lib, fv] = await Promise.all([
        getUserDetails(id),
        getUserLibrary(id, 20),
        getUserFavorites(id, 20),
      ]);
      setDetails(d);
      setLibrary(lib);
      setFavs(fv);
    } catch {
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const handleSuspend = async (suspend: boolean) => {
    if (!id || !details) return;
    setActioning(true);
    try {
      await updateUser(id, { is_suspended: suspend });
      await logAdminAction(
        suspend ? 'user_suspended' : 'user_restored',
        'user', id,
        { email: details.profile.email ?? undefined }
      );
      toast.success(suspend ? 'User suspended' : 'User restored');
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActioning(false);
    }
  };

  const handleRoleToggle = async () => {
    if (!id || !details) return;
    const newRole = details.profile.role === 'admin' ? 'user' : 'admin';
    setActioning(true);
    try {
      await updateUser(id, { role: newRole });
      await logAdminAction('user_role_changed', 'user', id, { new_role: newRole });
      toast.success(`Role changed to ${newRole}`);
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActioning(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !details) return;
    setActioning(true);
    try {
      await logAdminAction('user_deleted', 'user', id, { email: details.profile.email ?? undefined });
      await deleteUser(id);
      toast.success('User deleted');
      navigate('/admin/users');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Action failed');
      setActioning(false);
    }
  };

  const p = details?.profile;
  const displayName = p ? (p.full_name || p.display_name || p.username || p.email || p.id.slice(0, 8)) : '…';
  const initial     = displayName.charAt(0).toUpperCase();
  const avatarUrl   = p?.avatar_url || p?.provider_avatar_url;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: 'Users', href: '/admin/users' },
        { label: loading ? '…' : displayName },
      ]}
    >
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs -ml-2">
          <Link to="/admin/users"><ArrowLeft className="w-3.5 h-3.5" /> Back to Users</Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : !details ? (
        <div className="text-center py-16 text-muted-foreground">User not found</div>
      ) : (
        <div className="space-y-5">
          {/* Profile card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <Avatar className="w-16 h-16 shrink-0">
                  {avatarUrl && <AvatarImage src={avatarUrl} />}
                  <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold">{initial}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold">{displayName}</h2>
                    {p!.role === 'admin' && (
                      <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30">Admin</Badge>
                    )}
                    {p!.is_suspended && (
                      <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{p!.email}</p>
                  {p!.username && <p className="text-xs text-muted-foreground">@{p!.username}</p>}
                  <div className="flex flex-wrap gap-4 mt-3">
                    <p className="text-[11px] text-muted-foreground">
                      Joined {new Date(p!.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Updated {new Date(p!.updated_at).toLocaleDateString()}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground/60">{p!.id}</p>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button
                    variant="outline" size="sm"
                    onClick={handleRoleToggle}
                    disabled={actioning}
                    className="gap-1.5 text-xs h-8"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    {p!.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </Button>
                  {p!.is_suspended ? (
                    <Button variant="outline" size="sm" onClick={() => handleSuspend(false)} disabled={actioning} className="gap-1.5 text-xs h-8 text-chart-3 border-chart-3/40">
                      <ShieldCheck className="w-3.5 h-3.5" /> Restore
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleSuspend(true)} disabled={actioning} className="gap-1.5 text-xs h-8 text-destructive border-destructive/40">
                      <ShieldBan className="w-3.5 h-3.5" /> Suspend
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={actioning} className="gap-1.5 text-xs h-8 text-destructive border-destructive/40">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete user account?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently deletes <strong>{displayName}</strong> and all their data — library, favorites, watchlist, episode progress.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete permanently
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button variant="ghost" size="sm" onClick={() => load()} disabled={loading} className="gap-1.5 text-xs h-8">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats row */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <StatBadge label="Library"   value={details.library_count} />
            <StatBadge label="Favorites" value={details.favorites_count} />
            <StatBadge label="Watchlist" value={details.watchlist_count} />
            <StatBadge label="Watching"  value={details.watching_count} />
            <StatBadge label="Completed" value={details.completed_count} />
            <StatBadge label="Episodes"  value={details.episode_progress_count} />
          </div>

          {/* Activity tabs */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">User Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="library">
                <TabsList className="h-8 text-xs mb-4">
                  <TabsTrigger value="library" className="text-xs gap-1.5"><BookOpen className="w-3 h-3" /> Library</TabsTrigger>
                  <TabsTrigger value="favorites" className="text-xs gap-1.5"><Heart className="w-3 h-3" /> Favorites</TabsTrigger>
                </TabsList>

                <TabsContent value="library">
                  {library.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No library items</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {library.map(item => (
                        <Link key={item.id} to={`/detail/${item.media_type}/${item.tmdb_id}`}
                          className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors group"
                        >
                          {item.poster_path
                            ? <img src={tmdbImageUrl(item.poster_path, 'w92') ?? ''} alt={item.title} className="w-10 h-14 rounded object-cover shrink-0" />
                            : <div className="w-10 h-14 rounded bg-muted flex items-center justify-center shrink-0"><User2 className="w-4 h-4 text-muted-foreground" /></div>
                          }
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate">{item.title}</p>
                            <Badge variant="secondary" className="text-[9px] mt-1">{item.status}</Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="favorites">
                  {favs.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No favorites</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {favs.map(item => (
                        <Link key={item.id} to={`/detail/${item.media_type}/${item.tmdb_id}`}
                          className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
                        >
                          {item.poster_path
                            ? <img src={tmdbImageUrl(item.poster_path, 'w92') ?? ''} alt={item.title} className="w-10 h-14 rounded object-cover shrink-0" />
                            : <div className="w-10 h-14 rounded bg-muted shrink-0" />
                          }
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{item.media_type}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
