import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AdminLayout from '@/components/admin/AdminLayout';

interface SettingRow {
  label: string;
  value: string;
  badge?: string;
  sensitive?: boolean;
}

function SettingsSection({ title, description, rows }: { title: string; description?: string; rows: SettingRow[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <Separator />
      <CardContent className="pt-0">
        <div className="divide-y divide-border/50">
          {rows.map(row => (
            <div key={row.label} className="flex items-center justify-between py-3 gap-4">
              <div>
                <p className="text-sm font-medium">{row.label}</p>
                {row.sensitive && <p className="text-[10px] text-muted-foreground mt-0.5">Value hidden for security</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {row.badge && <Badge variant="secondary" className="text-[10px]">{row.badge}</Badge>}
                {!row.sensitive && (
                  <span className="text-xs font-mono text-muted-foreground max-w-[200px] truncate">{row.value}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminSettingsPage() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string ?? '';
  const siteUrl     = import.meta.env.VITE_SITE_URL as string ?? window.location.origin;
  const appId       = import.meta.env.VITE_APP_ID as string ?? '—';
  const tmdbKey     = import.meta.env.VITE_TMDB_API_KEY as string ?? '';

  return (
    <AdminLayout title="Settings" breadcrumbs={[{ label: 'Settings' }]}>
      <div className="max-w-2xl space-y-5">
        <p className="text-xs text-muted-foreground">
          This page shows actual WatchBox configuration. Secrets and API keys are never displayed.
          To change environment variables, update your deployment configuration.
        </p>

        <SettingsSection
          title="General"
          description="Core application settings"
          rows={[
            { label: 'App ID',     value: appId },
            { label: 'Site URL',   value: siteUrl },
            { label: 'Build Mode', value: import.meta.env.MODE, badge: import.meta.env.MODE },
          ]}
        />

        <SettingsSection
          title="Supabase"
          description="Backend database and auth configuration"
          rows={[
            { label: 'Supabase URL',        value: supabaseUrl.replace('https://', '').slice(0, 40) + '…' },
            { label: 'Anon Key',            value: '•••••',    sensitive: true  },
            { label: 'Auth',                value: 'Supabase Auth (email + OAuth)', badge: 'Enabled' },
            { label: 'Storage',             value: 'Supabase Storage', badge: 'Enabled' },
            { label: 'RLS',                 value: 'Row-Level Security on all tables', badge: 'Active' },
          ]}
        />

        <SettingsSection
          title="Content / APIs"
          description="Third-party content sources"
          rows={[
            { label: 'TMDB API Key',        value: '•••••',    sensitive: true  },
            { label: 'TMDB API Key Status', value: tmdbKey ? 'Configured' : 'Missing', badge: tmdbKey ? 'OK' : 'Missing' },
            { label: 'TMDB Image CDN',      value: 'https://image.tmdb.org/t/p/' },
          ]}
        />

        <SettingsSection
          title="Recommendations"
          description="Content recommendation engine settings"
          rows={[
            { label: 'Engine',         value: 'Genre-frequency interaction scoring' },
            { label: 'Interaction types', value: 'view, play, like, add_library, add_watchlist' },
            { label: 'Lookback window', value: '50 most recent interactions' },
            { label: 'Top genres',      value: 'Top 3 by weighted frequency' },
          ]}
        />

        <SettingsSection
          title="Security"
          description="Authorization and access control"
          rows={[
            { label: 'Admin role',      value: 'profiles.role = \'admin\'' },
            { label: 'Authorization',   value: 'Server-side via SECURITY DEFINER RPCs', badge: 'Active' },
            { label: 'Session storage', value: 'localStorage (Supabase default)', badge: 'SPA' },
            { label: 'Audit logging',   value: 'All admin actions logged to admin_audit_logs', badge: 'Active' },
          ]}
        />
      </div>
    </AdminLayout>
  );
}
