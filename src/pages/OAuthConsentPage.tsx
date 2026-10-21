import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, Check, Clapperboard, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { safeAppPath } from '@/lib/safe-return-path';
import { noindexMetadata } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageMeta from '@/components/common/PageMeta';

type ConsentDetails = Extract<
  NonNullable<Awaited<ReturnType<typeof supabase.auth.oauth.getAuthorizationDetails>>['data']>,
  { authorization_id: string }
>;

type ClientPermissions = { read: boolean; write: boolean; destructive_actions_require_confirmation: boolean };

function registeredRedirect(value: string, registeredUri: string): string | null {
  try {
    const url = new URL(value);
    const registered = new URL(registeredUri);
    const scheme = url.protocol.slice(0, -1).toLowerCase();
    const safeCustomScheme = /^[a-z][a-z0-9+.-]*$/.test(scheme) && !['javascript', 'data', 'file', 'vbscript'].includes(scheme);
    const safeTransport = url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) || safeCustomScheme;
    if (!safeTransport || url.username || url.password) return null;
    if (url.protocol !== registered.protocol || url.host !== registered.host || url.pathname !== registered.pathname) return null;
    if (!url.searchParams.has('code') && !url.searchParams.has('error')) return null;
    return url.href;
  } catch {
    return null;
  }
}

function clientPermissionsPath(clientId: string): string {
  return `/api/oauth/client-permissions?client_id=${encodeURIComponent(clientId)}`;
}

export default function OAuthConsentPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const authorizationId = searchParams.get('authorization_id')?.trim() ?? '';
  const [details, setDetails] = useState<ConsentDetails | null>(null);
  const [permissions, setPermissions] = useState<ClientPermissions | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<'approve' | 'deny' | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const next = safeAppPath(`${location.pathname}${location.search}`) ?? '/';
      navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true });
      return;
    }
    if (!authorizationId || authorizationId.length > 512) {
      setError('This OAuth request is missing a valid authorization reference. Return to your AI client and start the connection again.');
      setLoading(false);
      return;
    }

    let active = true;
    async function loadAuthorization() {
      try {
        const { data, error: detailsError } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
        if (detailsError || !data) throw new Error('authorization_lookup_failed');
        if ('redirect_url' in data) {
          const redirect = registeredRedirect(data.redirect_url, data.redirect_url);
          if (!redirect) throw new Error('invalid_redirect');
          window.location.assign(redirect);
          return;
        }

        const consent = data;
        if (!consent.authorization_id || !consent.client?.id || !consent.client?.name || consent.user?.id !== user?.id) {
          throw new Error('authorization_identity_mismatch');
        }
        const permissionResponse = await fetch(clientPermissionsPath(consent.client.id), { cache: 'no-store' });
        if (!permissionResponse.ok) throw new Error('permission_lookup_failed');
        const access = await permissionResponse.json() as ClientPermissions;
        if (!active) return;
        setDetails(consent);
        setPermissions(access);
        if (!access.read) setError('This registered client is not enabled for Watchbox read access. Contact the Watchbox administrator.');
      } catch {
        if (active) setError('We could not verify this authorization request. Check that you are signed into the correct Watchbox account, then return to your AI client and try again.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAuthorization();
    return () => { active = false; };
  }, [authLoading, authorizationId, location.pathname, location.search, navigate, user]);

  async function submitDecision(decision: 'approve' | 'deny') {
    if (!details || !permissions?.read || submitting) return;
    setSubmitting(decision);
    setError(null);
    try {
      const response = decision === 'approve'
        ? await supabase.auth.oauth.approveAuthorization(details.authorization_id, { skipBrowserRedirect: true })
        : await supabase.auth.oauth.denyAuthorization(details.authorization_id, { skipBrowserRedirect: true });
      if (response.error || !response.data?.redirect_url) throw new Error('authorization_decision_failed');
      const redirect = registeredRedirect(response.data.redirect_url, details.redirect_uri);
      if (!redirect) throw new Error('invalid_redirect');
      window.location.assign(redirect);
    } catch {
      setError('Watchbox could not finish this authorization. Return to your AI client and try again.');
      setSubmitting(null);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <PageMeta seo={noindexMetadata('Connect an AI client', '/oauth/consent')} />
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-6 flex items-center justify-center gap-2 text-sm font-semibold tracking-wide text-foreground">
          <Clapperboard className="h-5 w-5 text-primary" />
          WatchBox
        </div>
        <Card className="border-border/70 shadow-xl">
          <CardHeader className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle>Connect an AI client</CardTitle>
            <CardDescription>Review the app identity and access Watchbox is asking you to authorize.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Verifying the OAuth request…</div>
            ) : error && !details ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm" role="alert">
                <div className="mb-2 flex items-center gap-2 font-medium text-destructive"><AlertCircle className="h-4 w-4" />Authorization could not be verified</div>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : details && permissions ? (
              <>
                <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Requesting client</p>
                  <p className="text-lg font-semibold">{details.client.name}</p>
                  <p className="break-all font-mono text-xs text-muted-foreground">Client ID: {details.client.id}</p>
                  <p className="break-all text-xs text-muted-foreground">Redirect: {details.redirect_uri}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">Watchbox permissions</p>
                    <Badge variant={permissions.write ? 'default' : 'secondary'}>{permissions.write ? 'Read and write' : 'Read only'}</Badge>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Read your library, watchlist, favorites, ratings, notes and episode progress.</li>
                    {permissions.write && <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Add titles and update status, ratings, notes and episode progress.</li>}
                    {permissions.write && <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Remove a single watchlist title only when that specific action is explicitly confirmed.</li>}
                    <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />The client cannot access other Watchbox accounts; your account identity is verified by Supabase.</li>
                  </ul>
                  {permissions.write && <p className="text-xs text-muted-foreground">Write access is enabled for this registered client by Watchbox’s server configuration. A read-only client cannot make changes.</p>}
                </div>

                <div className="space-y-1 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Signed in as {user?.email ?? 'your Watchbox account'}</p>
                  {details.scope && <p>Identity scopes: {details.scope}</p>}
                  <p>Approving allows this client to use your Watchbox account until you revoke its access from your authentication settings.</p>
                </div>

                {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button variant="outline" disabled={submitting !== null} onClick={() => void submitDecision('deny')}>
                    {submitting === 'deny' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Deny
                  </Button>
                  <Button disabled={submitting !== null || !permissions.read} onClick={() => void submitDecision('approve')}>
                    {submitting === 'approve' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Allow access
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Authorization details are not available.</p>
            )}
          </CardContent>
        </Card>
        <p className="mt-5 text-center text-xs text-muted-foreground">If you did not start this connection, deny it and close the page.</p>
      </div>
    </main>
  );
}
