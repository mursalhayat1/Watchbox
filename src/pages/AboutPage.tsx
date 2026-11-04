import { ArrowRight, BarChart3, Compass, Library, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import Silk from '@/components/ui/Silk';
import PageMeta from '@/components/common/PageMeta';
import { generateStaticMetadata } from '@/lib/seo';
import { GlassButton, GlassFilterDef } from '@/components/ui/liquid-glass';

// ── Feature content ───────────────────────────────────────────────────────────
interface Feature {
  id:      string;
  icon:    React.ComponentType<{ className?: string }>;
  accent:  string;
  title:   string;
  text:    string;
}

const FEATURES: Feature[] = [
  {
    id:     'track',
    icon:   Library,
    accent: '#22d3ee',
    title:  'Track everything',
    text:   'Keep your whole watch life in one place — Currently Watching, Completed, Plan to Watch, On Hold and Dropped — with ratings from 0 to 10, personal notes and lists, plus a spot for your favorite actors.',
  },
  {
    id:     'discover',
    icon:   Compass,
    accent: '#a78bfa',
    title:  'Discover your next favorite',
    text:   'Browse trending movies and shows, dig through the Discover page, and get a For You feed built around what you actually watch — all powered by TMDb data.',
  },
  {
    id:     'stats',
    icon:   BarChart3,
    accent: '#34d399',
    title:  'Watch stats that feel personal',
    text:   'Your library becomes a story — see what you watch, how much, and how you rate it. WatchBox turns every status change and rating into stats worth coming back for.',
  },
  {
    id:     'ai',
    icon:   Sparkles,
    accent: '#fbbf24',
    title:  'Bring your AI assistant',
    text:   'WatchBox speaks MCP, so ChatGPT and Claude can connect to your library directly — ask about your favorites, next up, or watch stats inside any chat.',
  },
];

// Glass card surface — mirrors the recipe in components/ui/liquid-glass.tsx
const glassCard: React.CSSProperties = {
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)',
  border: '1px solid rgba(255,255,255,0.14)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.20), inset 1px 0 0 rgba(255,255,255,0.08)',
  transition: 'filter 200ms ease, transform 150ms ease, border-color 200ms ease',
};

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <div
      className="rounded-3xl p-6 md:p-7 flex flex-col hover:-translate-y-0.5 hover:border-white/25"
      style={glassCard}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)')}
    >
      {/* Head */}
      <div className="flex items-center gap-3.5 mb-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0"
          style={{
            background: `linear-gradient(135deg, ${feature.accent}33 0%, ${feature.accent}11 100%)`,
            border: `1px solid ${feature.accent}55`,
            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-white leading-tight">{feature.title}</h2>
      </div>
      <p className="text-sm text-white/65 leading-relaxed">{feature.text}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const seo = generateStaticMetadata({
    title: 'About WatchBox',
    description:
      'WatchBox is a personal media universe for movies and TV — track what you watch, discover trending titles, see your watch stats, and connect ChatGPT or Claude through MCP.',
    path: '/about',
  });

  return (
    <div className="relative min-h-screen bg-[#050a0e] flex flex-col overflow-x-hidden">
      <PageMeta seo={seo} />
      <GlassFilterDef />

      {/* Fixed Silk background — same fiber atmosphere as Home */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Silk color="#0e7490" speed={3} scale={1.3} noiseIntensity={1.1} rotation={0.25} />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(0,18,26,0.82) 0%, rgba(0,12,20,0.88) 40%, rgba(0,8,16,0.92) 100%)' }}
        />
        <div
          className="absolute top-0 left-0 w-[600px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(6,182,212,0.10) 0%, transparent 70%)' }}
        />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1 w-full max-w-screen-2xl mx-auto px-4 md:px-6 pt-28 pb-24">
        <div className="max-w-3xl mx-auto">

          {/* ── Heading ───────────────────────────────────────────────────── */}
          <div className="text-center mb-10">
            <img
              src="/images/logo/logo-glass.png"
              alt=""
              aria-hidden="true"
              draggable={false}
              className="w-16 h-16 mx-auto mb-6 object-contain"
            />
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.38)' }}>
              About WatchBox
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Your personal media universe
            </h1>
            <p className="text-sm md:text-base text-white/55 mt-3 max-w-xl mx-auto leading-relaxed">
              WatchBox is a home for everything you watch — a quiet place to track shows and movies,
              find what's next, and see your watching habits take shape over time.
            </p>
          </div>

          {/* ── Feature cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {FEATURES.map(feature => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </div>

          {/* ── AI / MCP call-out ─────────────────────────────────────────── */}
          <div
            className="rounded-2xl px-6 py-6 md:px-7 mb-8 flex flex-col sm:flex-row sm:items-center gap-5"
            style={glassCard}
          >
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white leading-tight mb-1">Talk to your library</h2>
              <p className="text-sm text-white/60 leading-relaxed">
                Connect WatchBox to ChatGPT or Claude as an MCP connector and your assistant knows
                your watchlist, favorites and stats — no copy-pasting required.
              </p>
            </div>
            <GlassButton asChild size="lg" className="shrink-0">
              <Link to="/connect" className="flex items-center gap-2">
                Connect your AI
                <ArrowRight className="w-4 h-4" />
              </Link>
            </GlassButton>
          </div>

          {/* ── Attribution ───────────────────────────────────────────────── */}
          <p className="text-xs text-white/35 text-center leading-relaxed max-w-lg mx-auto">
            Media data provided by TMDb. Not endorsed by TMDb.
          </p>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
