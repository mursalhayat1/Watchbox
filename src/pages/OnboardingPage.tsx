import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AtSign, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import PageMeta from '@/components/common/PageMeta';
import { noindexMetadata } from '@/lib/seo';

const cyanNb = 'hsl(189,80%,4%)';
const cyanDp = 'hsla(189,80%,18%,0.55)';
const cyanDs = 'hsla(189,60%,28%,0.30)';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [username, setUsername]       = useState('');
  const [checking, setChecking]       = useState(false);
  const [available, setAvailable]     = useState<boolean | null>(null);
  const [submitting, setSubmitting]   = useState(false);

  const isValid = /^[a-zA-Z0-9_]{3,24}$/.test(username);

  const checkAvailability = async (val: string) => {
    if (!val || !/^[a-zA-Z0-9_]{3,24}$/.test(val)) {
      setAvailable(null);
      return;
    }
    setChecking(true);
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', val.toLowerCase())
      .maybeSingle();
    setAvailable(data === null);
    setChecking(false);
  };

  const handleChange = (v: string) => {
    setUsername(v);
    setAvailable(null);
    const trimmed = v.trim().toLowerCase();
    const timeout = setTimeout(() => checkAvailability(trimmed), 600);
    return () => clearTimeout(timeout);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !available || !user) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.toLowerCase(), onboarded: true })
        .eq('id', user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success(`Welcome, @${username.toLowerCase()}!`);
      navigate('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save username');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: cyanNb }}>
      <PageMeta seo={noindexMetadata('Set Up Your Profile', '/onboarding')} />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: cyanNb }} />
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 80% 60% at 15% -5%, ${cyanDp} 0%, transparent 70%)`,
        }} />
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse 60% 40% at 85% 5%, ${cyanDs} 0%, transparent 65%)`,
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-3xl"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}>
            🎬
          </div>
          <h1 className="text-2xl font-bold text-white">Choose your username</h1>
          <p className="text-white/45 text-sm mt-2 max-w-xs">
            This is your unique handle. Others can find your profile at<br />
            <span className="text-cyan-400">watchbox.app/u/username</span>
          </p>
        </div>

        <div className="rounded-2xl p-6 md:p-8"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', backdropFilter: 'blur(20px)' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={e => handleChange(e.target.value)}
                  placeholder="yourname"
                  maxLength={24}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.07] border text-white text-sm placeholder:text-white/30 outline-none transition-all"
                  style={{
                    borderColor: available === true
                      ? 'rgba(34,197,94,0.5)'
                      : available === false
                        ? 'rgba(239,68,68,0.5)'
                        : 'rgba(255,255,255,0.10)',
                  }}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {checking && <Loader2 className="w-4 h-4 text-white/40 animate-spin" />}
                  {!checking && available === true && <Check className="w-4 h-4 text-green-400" />}
                  {!checking && available === false && (
                    <span className="text-red-400 text-xs font-semibold">Taken</span>
                  )}
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-white/30">Letters, digits and _ · 3–24 chars</p>
                <span className="text-xs text-white/25">{username.length}/24</span>
              </div>
              {username && !isValid && (
                <p className="text-xs text-red-400/80 mt-1">Invalid username format</p>
              )}
            </div>

            {/* Preview */}
            {isValid && available && (
              <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.20)' }}>
                <Check className="w-4 h-4 text-green-400 shrink-0" />
                <span className="text-sm text-white/70">
                  Your profile will be at{' '}
                  <span className="text-white font-semibold">/u/{username.toLowerCase()}</span>
                </span>
              </div>
            )}

            <button type="submit"
              disabled={!isValid || !available || submitting}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, hsl(189,70%,30%), hsl(189,80%,20%))' }}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Claim Username
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
