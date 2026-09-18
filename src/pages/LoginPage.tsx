import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff, Clapperboard, Chrome } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Silk from '@/components/ui/Silk';
import { GlassFilterDef } from '@/components/ui/liquid-glass';
import PageMeta from '@/components/common/PageMeta';
import { noindexMetadata } from '@/lib/seo';

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithDiscord, signInWithEmail, signUpWithEmail } = useAuth();

  const [tab, setTab]           = useState<'signin' | 'signup'>('signin');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const [busy, setBusy]         = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'signup' && !agreed) {
      toast.error('Please agree to the User Agreement & Privacy Policy');
      return;
    }
    setBusy(true);
    try {
      const { error } = tab === 'signin'
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password);
      if (error) throw error;
      if (tab === 'signup') {
        toast.success('Check your email to confirm your account!');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'hsl(189,80%,4%)' }}>
      <PageMeta seo={noindexMetadata('Sign In', '/login')} />

      <GlassFilterDef />

      {/* Silk animated background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Silk color="#0e7490" speed={3} scale={1.3} noiseIntensity={1.1} rotation={0.25} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(0,18,26,0.88) 0%, rgba(0,12,20,0.92) 40%, rgba(0,8,16,0.95) 100%)' }} />
        <div className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(14,116,144,0.20) 0%, transparent 70%)' }} />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo + title */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 hover:opacity-80 transition-opacity"
            style={{ background: 'rgba(14,116,144,0.30)', border: '1px solid rgba(14,116,144,0.55)' }}>
            <Clapperboard className="w-7 h-7 text-cyan-300" />
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {tab === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {tab === 'signin' ? 'Sign in to your WatchBox account' : 'Start tracking your movies & shows'}
          </p>
        </div>

        <div className="rounded-2xl p-6 md:p-8"
          style={{
            background: 'rgba(10,25,30,0.72)',
            border: '1px solid rgba(14,116,144,0.30)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>

          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-6"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {(['signin', 'signup'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={tab === t
                  ? { background: 'rgba(14,116,144,0.45)', color: '#fff', boxShadow: '0 2px 8px rgba(14,116,144,0.25)' }
                  : { color: 'rgba(255,255,255,0.40)' }}>
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* OAuth */}
          <div className="flex flex-col gap-3 mb-5">
            <button onClick={() => signInWithGoogle()}
              className="flex items-center justify-center gap-3 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-85 active:scale-[0.98]"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}>
              <Chrome className="w-4 h-4" />
              Continue with Google
            </button>
            <button onClick={() => signInWithDiscord()}
              className="flex items-center justify-center gap-3 w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-85 active:scale-[0.98]"
              style={{ background: 'rgba(88,101,242,0.20)', border: '1px solid rgba(88,101,242,0.40)' }}>
              <DiscordIcon className="w-4 h-4" />
              Continue with Discord
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.09)' }} />
            <span className="text-xs text-white/30 font-medium">or with email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.09)' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="flex flex-col gap-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-white/28 outline-none focus:border-cyan-500/55 focus:bg-white/10 transition-all" />
            </div>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-4 pr-11 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm placeholder:text-white/28 outline-none focus:border-cyan-500/55 focus:bg-white/10 transition-all" />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {tab === 'signup' && (
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-cyan-500 shrink-0" />
                <span className="text-xs text-white/40 leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-cyan-400 hover:underline">User Agreement</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>
                </span>
              </label>
            )}

            <button type="submit" disabled={busy}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, hsl(189,70%,32%), hsl(189,80%,22%))' }}>
              {busy ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © {new Date().getFullYear()} WatchBox. All rights reserved.
        </p>
      </div>
    </div>
  );
}
