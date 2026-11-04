import { useState } from 'react';
import { Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import Silk from '@/components/ui/Silk';
import PageMeta from '@/components/common/PageMeta';
import { generateStaticMetadata } from '@/lib/seo';
import { publicRuntimeConfig } from '@/lib/runtime-config';
import { GlassButton, GlassFilterDef } from '@/components/ui/liquid-glass';
import { toast } from 'sonner';

// ── MCP server URL ────────────────────────────────────────────────────────────
// The MCP server is hosted on this site's own domain (api/mcp.ts, mounted at
// /mcp by the vercel.json rewrite) — so the canonical connector URL is simply
// the site origin + /mcp. VITE_MCP_PUBLIC_URL (or injected config) overrides.
const MCP_SERVER_URL =
  publicRuntimeConfig.mcpPublicUrl
  ?? (publicRuntimeConfig.siteUrl
    ? `${publicRuntimeConfig.siteUrl.replace(/\/$/, '')}/mcp`
    : null);

interface AssistantOption {
  id:        string;
  name:      string;
  glyph:     string;
  accent:    string;
  tagline:   string;
  /** Settings page deep link opened by the CTA */
  openUrl:   string;
  cta:       string;
  steps:     string[];
}

const ASSISTANTS: AssistantOption[] = [
  {
    id:      'chatgpt',
    name:    'ChatGPT',
    glyph:   'G',
    accent:  '#10a37f',
    tagline: 'OpenAI Apps & Connectors',
    openUrl: 'https://chatgpt.com/plugins',
    cta:     'Open ChatGPT Plugins',
    steps:   [
      'Click below — it opens the ChatGPT Plugins page.',
      'Select "Create" (or "Add custom connector" in Developer mode).',
      'Name it WatchBox and paste the MCP server URL from above.',
      'In any chat ask WatchBox something — approve the WatchBox sign-in on first use.',
    ],
  },
  {
    id:      'claude',
    name:    'Claude',
    glyph:   '✳',
    accent:  '#d97757',
    tagline: 'Anthropic Custom Connectors',
    openUrl: 'https://claude.ai/customize/connectors',
    cta:     'Open Claude Connectors',
    steps:   [
      'Click below — it opens claude.ai Settings → Connectors.',
      'Select "Add custom connector".',
      'Name it WatchBox and paste the MCP server URL from above.',
      'Connect, approve the WatchBox sign-in, then start asking in chat.',
    ],
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

// ── Assistant option card ─────────────────────────────────────────────────────
function AssistantCard({ option }: { option: AssistantOption }) {
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
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0"
          style={{
            background: `linear-gradient(135deg, ${option.accent}33 0%, ${option.accent}11 100%)`,
            border: `1px solid ${option.accent}55`,
            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
          }}
        >
          {option.glyph}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white leading-tight">{option.name}</h2>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{option.tagline}</p>
        </div>
      </div>

      {/* Steps */}
      <ol className="flex flex-col gap-3 mb-6 flex-1">
        {option.steps.map((step, i) => (
          <li key={i} className="flex gap-3">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold text-white/80 shrink-0 mt-0.5"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}
            >
              {i + 1}
            </span>
            <p className="text-sm text-white/65 leading-relaxed">{step}</p>
          </li>
        ))}
      </ol>

      {/* CTA */}
      <GlassButton asChild size="lg">
        <a href={option.openUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2">
          {option.cta}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </GlassButton>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function McpPage() {
  const [copied, setCopied] = useState(false);

  const seo = generateStaticMetadata({
    title: 'MCP — Connect WatchBox to ChatGPT & Claude',
    description:
      'Add WatchBox to ChatGPT or Claude as a Model Context Protocol connector and ask your AI assistant about your library, favorites, and watch stats.',
    path: '/connect',
  });

  const copyUrl = async () => {
    if (!MCP_SERVER_URL) return;
    try {
      await navigator.clipboard.writeText(MCP_SERVER_URL);
      setCopied(true);
      toast.success('MCP server URL copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — please copy the URL manually.');
    }
  };

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
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Model Context Protocol
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Connect WatchBox to your AI
            </h1>
            <p className="text-sm md:text-base text-white/55 mt-3 max-w-xl mx-auto leading-relaxed">
              WatchBox is an MCP server — an open standard that lets ChatGPT and Claude use real apps.
              Add it as a connector and your assistant can see your library, favorites, and watch stats.
            </p>
          </div>

          {/* ── Server URL panel ──────────────────────────────────────────── */}
          {MCP_SERVER_URL ? (
            <div
              className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-10"
              style={glassCard}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  WatchBox MCP Server URL
                </p>
                <p className="font-mono text-sm text-white/85 truncate select-all">{MCP_SERVER_URL}</p>
              </div>
              <GlassButton onClick={copyUrl} size="md" className="shrink-0">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy URL'}
              </GlassButton>
            </div>
          ) : (
            <div
              className="rounded-2xl px-5 py-4 mb-10 text-center"
              style={glassCard}
            >
              <p className="text-sm text-white/60">
                MCP server URL is not configured. Set <span className="font-mono">VITE_MCP_PUBLIC_URL</span> in your environment.
              </p>
            </div>
          )}

          {/* ── Assistant options ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {ASSISTANTS.map(option => (
              <AssistantCard key={option.id} option={option} />
            ))}
          </div>

          {/* ── Trust note ────────────────────────────────────────────────── */}
          <p className="flex items-start justify-center gap-2 text-xs text-white/35 text-center leading-relaxed max-w-lg mx-auto">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            Connecting uses OAuth — WatchBox never sees your ChatGPT or Claude account,
            and you can revoke access at any time from their connector settings.
          </p>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
