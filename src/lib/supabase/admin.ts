/**
 * Admin API layer — all functions call SECURITY DEFINER RPCs.
 * The server verifies admin role on every call; never trust client-side checks alone.
 * No service-role key is used here — only the anon key with auth session.
 */
import { supabase } from './client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_users: number;
  new_users: number;
  total_library_items: number;
  new_library_items: number;
  total_favorites: number;
  total_watchlist_items: number;
  total_episode_progress: number;
  currently_watching_users: number;
}

export interface AdminUser {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  provider_avatar_url: string | null;
  role: 'user' | 'admin';
  is_suspended: boolean;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
  library_count: number;
  favorites_count: number;
  watchlist_count: number;
}

export interface AdminUserListResult {
  total: number;
  rows: AdminUser[];
}

export interface AdminUserDetails {
  profile: AdminUser;
  library_count: number;
  favorites_count: number;
  watchlist_count: number;
  watching_count: number;
  completed_count: number;
  episode_progress_count: number;
}

export interface ActivityRow {
  day: string;
  library_adds: number;
  favorites_adds: number;
  watchlist_adds: number;
}

export interface UserGrowthRow {
  day: string;
  new_users: number;
  cumulative_users: number;
}

export interface TopTitle {
  tmdb_id: number;
  title: string;
  media_type: string;
  save_count: number;
  poster_path: string | null;
}

export interface MediaDistribution {
  media_type: string;
  cnt: number;
}

export interface StatusDistribution {
  status: string;
  cnt: number;
}

export interface WatchDataRow {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  tmdb_id: number;
  title: string;
  media_type: string;
  status?: string;
  vote_average: number | null;
  release_date: string | null;
  poster_path: string | null;
  added_at: string;
  updated_at?: string;
}

export interface WatchDataResult {
  total: number;
  rows: WatchDataRow[];
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  status: string;
  created_at: string;
}

export interface AuditLogResult {
  total: number;
  rows: AuditLog[];
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function getAdminStats(days?: number): Promise<AdminStats> {
  const { data, error } = await supabase.rpc('admin_get_stats', {
    p_days: days ?? null,
  });
  if (error) throw error;
  return data as AdminStats;
}

// ── User Growth ───────────────────────────────────────────────────────────────

export async function getUserGrowth(days = 30): Promise<UserGrowthRow[]> {
  const { data, error } = await supabase.rpc('admin_get_user_growth', { p_days: days });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// ── Activity ──────────────────────────────────────────────────────────────────

export async function getActivity(days = 30): Promise<ActivityRow[]> {
  const { data, error } = await supabase.rpc('admin_get_activity', { p_days: days });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// ── Top Titles ────────────────────────────────────────────────────────────────

export async function getTopTitles(limit = 10, mediaType?: 'movie' | 'tv'): Promise<TopTitle[]> {
  const { data, error } = await supabase.rpc('admin_get_top_titles', {
    p_limit: limit,
    p_media_type: mediaType ?? null,
  });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// ── Media + Status distributions ─────────────────────────────────────────────

export async function getMediaDistribution(): Promise<MediaDistribution[]> {
  const { data, error } = await supabase.rpc('admin_get_media_distribution');
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getStatusDistribution(): Promise<StatusDistribution[]> {
  const { data, error } = await supabase.rpc('admin_get_status_distribution');
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// ── User Management ───────────────────────────────────────────────────────────

export async function listUsers(
  search?: string,
  limit = 20,
  offset = 0,
  sortBy: 'created_at' | 'email' = 'created_at',
  sortDir: 'asc' | 'desc' = 'desc',
): Promise<AdminUserListResult> {
  const { data, error } = await supabase.rpc('admin_list_users', {
    p_search:   search ?? null,
    p_limit:    limit,
    p_offset:   offset,
    p_sort_by:  sortBy,
    p_sort_dir: sortDir,
  });
  if (error) throw error;
  return data as AdminUserListResult;
}

export async function getUserDetails(userId: string): Promise<AdminUserDetails> {
  const { data, error } = await supabase.rpc('admin_get_user_details', {
    p_user_id: userId,
  });
  if (error) throw error;
  return data as AdminUserDetails;
}

export async function updateUser(
  userId: string,
  opts: { is_suspended?: boolean; role?: 'user' | 'admin' },
): Promise<void> {
  const { error } = await supabase.rpc('admin_update_user', {
    p_user_id:     userId,
    p_is_suspended: opts.is_suspended ?? null,
    p_role:         opts.role ?? null,
  });
  if (error) throw error;
}

export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_user', { p_user_id: userId });
  if (error) throw error;
}

// ── User library/favorites for detail view ────────────────────────────────────

export async function getUserLibrary(userId: string, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('library_items')
    .select('id,tmdb_id,title,media_type,status,poster_path,vote_average,release_date,added_at')
    .eq('user_id', userId)
    .order('added_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getUserFavorites(userId: string, limit = 50, offset = 0) {
  const { data, error } = await supabase
    .from('favorite_items')
    .select('id,tmdb_id,title,media_type,poster_path,vote_average,release_date,added_at')
    .eq('user_id', userId)
    .order('added_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// ── Watch Data ────────────────────────────────────────────────────────────────

export async function getWatchData(
  table: 'library_items' | 'favorite_items' | 'watchlist_items' = 'library_items',
  search?: string,
  limit = 25,
  offset = 0,
): Promise<WatchDataResult> {
  const { data, error } = await supabase.rpc('admin_get_watch_data', {
    p_table:  table,
    p_search: search ?? null,
    p_limit:  limit,
    p_offset: offset,
  });
  if (error) throw error;
  return data as WatchDataResult;
}

// ── Audit Logs ────────────────────────────────────────────────────────────────

export async function getAuditLogs(limit = 25, offset = 0): Promise<AuditLogResult> {
  const { data, error } = await supabase.rpc('admin_get_audit_logs', {
    p_limit:  limit,
    p_offset: offset,
  });
  if (error) throw error;
  return data as AuditLogResult;
}

export async function logAdminAction(
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>,
  status: 'success' | 'error' = 'success',
): Promise<void> {
  const { error } = await supabase.rpc('admin_log_action', {
    p_action:      action,
    p_target_type: targetType ?? null,
    p_target_id:   targetId ?? null,
    p_details:     details ?? null,
    p_status:      status,
  });
  if (error) throw error;
}
