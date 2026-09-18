import { useEffect, useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAuditLogs, type AuditLog } from '@/lib/supabase/admin';
import { toast } from 'sonner';

const PAGE_SIZE = 25;

const ACTION_COLORS: Record<string, string> = {
  user_suspended:      'bg-destructive/20 text-destructive border-destructive/30',
  user_restored:       'bg-chart-3/20 text-chart-3 border-chart-3/30',
  user_deleted:        'bg-destructive/20 text-destructive border-destructive/30',
  user_role_changed:   'bg-primary/20 text-primary border-primary/30',
};

export default function AdminLogsPage() {
  const [logs, setLogs]     = useState<AuditLog[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAuditLogs(PAGE_SIZE, page * PAGE_SIZE);
      setLogs(result.rows ?? []);
      setTotal(result.total);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { void load(); }, [load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <AdminLayout
      title="Audit Logs"
      breadcrumbs={[{ label: 'Audit Logs' }]}
      actions={
        <Button variant="ghost" size="sm" onClick={load} disabled={loading} className="gap-1.5 text-xs h-8">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      }
    >
      <p className="text-xs text-muted-foreground mb-4">
        All significant administrative actions are recorded here. Passwords, tokens, and API keys are never logged.
      </p>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Timestamp</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Admin</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Target</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">Details</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                  : logs.length === 0
                    ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                          No audit logs yet
                        </td>
                      </tr>
                    )
                    : logs.map(log => (
                      <tr key={log.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                          {log.admin_email ?? log.admin_id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge
                            className={`text-[10px] border ${ACTION_COLORS[log.action] ?? 'bg-muted text-muted-foreground border-border'}`}
                          >
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                          {log.target_type ? `${log.target_type}: ` : ''}{log.target_id?.slice(0, 16)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {log.status === 'success'
                            ? <span className="text-[10px] text-chart-3">✓ success</span>
                            : <span className="text-[10px] text-destructive">✗ {log.status}</span>}
                        </td>
                        <td className="px-4 py-3 text-[10px] text-muted-foreground max-w-[160px] truncate">
                          {log.details ? JSON.stringify(log.details).slice(0, 60) : '—'}
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
