import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import PageMeta from '@/components/common/PageMeta';
import { noindexMetadata } from '@/lib/seo';

// Handles the OAuth redirect from Supabase (Google / Discord)
// URL pattern: /auth/callback#access_token=...
export default function AuthCallbackPage() {
  const navigate   = useNavigate();
  const { profile, loading, refreshProfile } = useAuth();
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Exchange code/fragment for session — supabase-js does this automatically
    // on detectSessionInUrl (default true). We just need to wait for the
    // onAuthStateChange listener in AuthContext to fire, then redirect.
    const check = async () => {
      // Give the auth state listener a moment to settle
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login', { replace: true });
        return;
      }
      await refreshProfile();
      setDone(true);
    };
    void check();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!done || loading) return;
    if (!profile?.onboarded || !profile?.username) {
      navigate('/onboarding', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [done, loading, profile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(189,80%,4%)' }}>
      <PageMeta seo={noindexMetadata('Signing In', '/auth/callback')} />
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
        <p className="text-white/40 text-sm">Signing you in…</p>
      </div>
    </div>
  );
}
