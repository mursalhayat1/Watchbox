import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, X, Clapperboard, Star, Home, Compass, Sparkles, BookOpen, LogIn,
  UserCircle2, BarChart2, LogOut, ShieldCheck, type LucideIcon,
} from 'lucide-react';
import { useMovieSearch } from '@/hooks/useTMDB';
import { tmdbImageUrl } from '@/services/tmdb';
import type { Movie } from '@/services/tmdb';
import { GlassButton, GlassIconButton, GlassFilterDef } from '@/components/ui/liquid-glass';
import { useAuth, getAvatarUrl, getDisplayName, hasProviderAvatar, getNameInitial } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ── Profile avatar / initial badge (shared between mobile + desktop) ─────────
function ProfileBadge({
  size = 24,
  active = false,
}: {
  size?: number;
  active?: boolean;
}) {
  const { user, profile } = useAuth();
  const avatarUrl   = getAvatarUrl(profile);
  const displayName = getDisplayName(profile);
  const showAvatar  = hasProviderAvatar(profile, user);
  const initial     = getNameInitial(profile);

  if (showAvatar && avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className="rounded-full object-cover"
        style={{
          width: size, height: size,
          border: active ? '2px solid #22d3ee' : '2px solid rgba(255,255,255,0.2)',
        }}
      />
    );
  }

  // Email user — show initial letter badge
  return (
    <span
      className="rounded-full flex items-center justify-center font-bold text-white select-none"
      style={{
        width: size, height: size,
        fontSize: size * 0.45,
        background: 'linear-gradient(135deg, hsl(189,70%,30%), hsl(189,80%,20%))',
        border: active ? '2px solid #22d3ee' : '2px solid rgba(255,255,255,0.2)',
      }}
    >
      {initial}
    </span>
  );
}

// ── Mobile bottom tab bar ─────────────────────────────────────────────────────
export function MobileTabBar({ onSearchOpen }: { onSearchOpen: () => void }) {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const tabs: { to?: string; icon: LucideIcon; label: string; onClick?: () => void; isProfile?: boolean }[] = [
    { to: '/',         icon: Home,      label: 'Home' },
    { to: '/discover', icon: Compass,   label: 'Discover' },
    { icon: Search,    label: 'Search', onClick: onSearchOpen },
    { to: '/library',  icon: BookOpen,  label: 'Library' },
    user
      ? { to: '/stats', icon: UserCircle2, label: 'Profile', isProfile: true }
      : { to: '/login', icon: LogIn,       label: 'Sign In' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-around px-2 pb-safe"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        background: 'rgba(5,10,14,0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.09)',
        height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {tabs.map((tab) => {
        const active = tab.to ? isActive(tab.to) : false;
        const Icon = tab.icon;
        const inner = (
          <span
            className="flex flex-col items-center justify-center gap-0.5 w-12 h-12"
            style={{ color: active ? '#22d3ee' : 'rgba(255,255,255,0.42)' }}
          >
            {tab.isProfile && user
              ? <ProfileBadge size={24} active={active} />
              : <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />
            }
          </span>
        );

        if (tab.onClick) {
          return (
            <button key={tab.label} onClick={tab.onClick} className="flex items-center justify-center">
              {inner}
            </button>
          );
        }
        return (
          <Link key={tab.label} to={tab.to!} className="flex items-center justify-center">
            {inner}
          </Link>
        );
      })}
    </nav>
  );
}

const NAV_LINKS: { label: string; to: string; icon: LucideIcon }[] = [
  { label: 'Home',     to: '/',         icon: Home    },
  { label: 'Discover', to: '/discover', icon: Compass },
  { label: 'For You',  to: '/for-you',  icon: Sparkles },
  { label: 'Library',  to: '/library',  icon: BookOpen },
];

// ── Full-page search overlay ─────────────────────────────────────────────────
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, loading } = useMovieSearch(query);
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    inputRef.current?.focus();
    return () => cancelAnimationFrame(t);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 220);
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [close]);

  const handleSelect = (item: Movie) => {
    const type = item.media_type === 'tv' ? 'tv' : 'movie';
    navigate(`/detail/${type}/${item.id}`);
    close();
  };

  const displayTitle = (m: Movie) => m.title ?? m.name ?? 'Unknown';
  const year = (m: Movie) => (m.release_date ?? m.first_air_date ?? '').slice(0, 4);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{
        background: 'rgba(0,0,0,0.88)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 220ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <GlassIconButton onClick={close} size={40} className="absolute top-5 right-5 z-10" aria-label="Close search">
        <X className="w-5 h-5" />
      </GlassIconButton>

      <div className="flex flex-col items-center pt-24 px-4 md:px-8"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(-16px)', transition: 'transform 280ms cubic-bezier(0.4,0,0.2,1)' }}>
        <p className="text-white/40 text-sm font-medium tracking-widest uppercase mb-5">Search</p>
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Movies, shows, actors..."
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/10 border border-white/15 text-white text-xl placeholder:text-white/30 outline-none focus:border-white/40 focus:bg-white/15 transition-all"
            style={{ caretColor: 'white' }} />
          {query && (
            <button onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-8 px-4 md:px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          {loading && (
            <div className="flex justify-center pt-12">
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />
                ))}
              </div>
            </div>
          )}
          {!loading && query.length > 1 && results.length === 0 && (
            <div className="text-center pt-16 text-white/40">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No results for <span className="text-white/70">"{query}"</span></p>
            </div>
          )}
          {query.length <= 1 && !loading && (
            <p className="text-center text-white/25 text-sm pt-8">Start typing to search across movies &amp; TV shows</p>
          )}
          {!loading && results.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {results.slice(0, 18).map((item) => (
                <button key={item.id} onClick={() => handleSelect(item)}
                  className="group flex flex-col text-left rounded-xl overflow-hidden bg-white/5 hover:bg-white/12 border border-white/8 hover:border-white/20 transition-all hover:scale-[1.03]">
                  <div className="aspect-[2/3] w-full overflow-hidden bg-white/5">
                    {item.poster_path ? (
                      <img src={tmdbImageUrl(item.poster_path, 'w342') ?? ''} alt={displayTitle(item)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Clapperboard className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-white truncate leading-tight">{displayTitle(item)}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {year(item) && <span className="text-[10px] text-white/40">{year(item)}</span>}
                      {item.vote_average > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-yellow-400/80">
                          <Star className="w-2.5 h-2.5 fill-yellow-400/80" />
                          {item.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Profile dropdown menu ─────────────────────────────────────────────────────
function ProfileDropdown({ onClose }: { onClose: () => void }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const displayName = getDisplayName(profile);
  const isAdmin = profile?.role === 'admin';
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSignOut = async () => {
    onClose();
    await signOut();
    toast.success('Signed out');
    navigate('/');
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-52 rounded-2xl overflow-hidden z-[100]"
      style={{
        background: 'rgba(8,18,24,0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
      }}
    >
      {/* User info header */}
      <div className="px-4 py-3 border-b border-white/[0.08]">
        <p className="text-sm font-semibold text-white truncate">{displayName}</p>
        {profile?.email && (
          <p className="text-xs text-white/40 truncate mt-0.5">{profile.email}</p>
        )}
      </div>

      {/* Menu items */}
      <div className="py-1.5">
        <Link
          to="/stats"
          onClick={onClose}
          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.07] transition-colors"
        >
          <BarChart2 className="w-4 h-4 shrink-0" />
          Stats &amp; Profile
        </Link>
        {isAdmin && (
          <Link
            to="/admin/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.07] transition-colors"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Admin Dashboard
          </Link>
        )}
      </div>

      <div className="border-t border-white/[0.08] py-1.5">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-white/[0.05] transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [searchOpen, setSearchOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location  = useLocation();
  const { user } = useAuth();

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <>
      <GlassFilterDef />

      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <GlassIconButton asChild size={40} style={{ borderRadius: '12px' }}>
            <Link to="/" aria-label="Home">
              <Clapperboard className="w-5 h-5" strokeWidth={2} />
            </Link>
          </GlassIconButton>

          {/* Centered nav — desktop only */}
          <nav className="hidden md:flex items-center gap-1.5">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.to);
              const Icon = link.icon;
              return (
                <GlassButton key={link.to} asChild size="sm" active={active} liquidFilter={false}>
                  <Link to={link.to} className="flex items-center gap-1.5">
                    {active && <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />}
                    {link.label}
                  </Link>
                </GlassButton>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search — always visible */}
            <GlassIconButton onClick={() => setSearchOpen(true)} size={36} aria-label="Open search">
              <Search className="w-4 h-4" />
            </GlassIconButton>

            {/* Auth — desktop only */}
            {user ? (
              <div className="relative hidden md:flex">
                <GlassIconButton
                  size={36}
                  aria-label="Open profile menu"
                  onClick={() => setProfileOpen((o) => !o)}
                >
                  <ProfileBadge size={24} active={profileOpen} />
                </GlassIconButton>
                {profileOpen && (
                  <ProfileDropdown onClose={() => setProfileOpen(false)} />
                )}
              </div>
            ) : (
              <GlassButton asChild size="sm" liquidFilter={false} className="hidden md:flex">
                <Link to="/login" className="flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              </GlassButton>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <MobileTabBar onSearchOpen={() => setSearchOpen(true)} />

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}



