import { Link } from 'react-router-dom';
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import Silk from '@/components/ui/Silk';
import PageMeta from '@/components/common/PageMeta';
import { generateStaticMetadata } from '@/lib/seo';
import { GlassFilterDef } from '@/components/ui/liquid-glass';
import type { LegalDoc } from '@/data/legalDocs';

// Legal routes — links between the three documents on every legal page
const LEGAL_ROUTES = [
  { label: 'Privacy Policy',   to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'User Agreement',   to: '/user-agreement' },
] as const;

interface LegalShellProps {
  doc: LegalDoc;
  /** This document's route, used for sibling highlighting + SEO path */
  path: string;
  meta: { title: string; description: string };
}

// Glass card surface — mirrors the recipe in components/ui/liquid-glass.tsx
const glassCard: React.CSSProperties = {
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)',
  border: '1px solid rgba(255,255,255,0.14)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.20), inset 1px 0 0 rgba(255,255,255,0.08)',
};

export default function LegalShell({ doc, path, meta }: LegalShellProps) {
  const seo = generateStaticMetadata({ title: meta.title, description: meta.description, path });

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative min-h-screen bg-[#050a0e] flex flex-col overflow-x-hidden">
      <PageMeta seo={seo} />
      <GlassFilterDef />

      {/* Fixed Silk background — same fiber atmosphere as MCP + Home */}
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

          {/* ── Heading ────────────────────────────────────────────────────── */}
          <div className="text-center mb-8">
            <p
              className="text-[10px] font-semibold tracking-widest uppercase mb-3"
              style={{ color: 'rgba(255,255,255,0.38)' }}
            >
              WatchBox Legal
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{doc.title}</h1>
            <p className="text-xs text-white/45 mt-3">
              Last updated — {doc.updatedAt}
            </p>
          </div>

          {/* ── Sibling documents ──────────────────────────────────────────── */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-6">
            {LEGAL_ROUTES.map(item => {
              const active = item.to === path;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-xs px-4 py-2 rounded-full transition-colors ${active ? 'text-white' : 'text-white/55 hover:text-cyan-200'}`}
                  style={active
                    ? { background: 'rgba(103,232,249,0.12)', border: '1px solid rgba(103,232,249,0.30)' }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* ── Table of contents ─────────────────────────────────────────── */}
          <nav
            className="rounded-2xl p-5 mb-8 scroll-mt-28"
            style={glassCard}
            aria-label="Table of contents"
          >
            <p
              className="text-[10px] font-semibold tracking-widest uppercase mb-3"
              style={{ color: 'rgba(255,255,255,0.38)' }}
            >
              On this page
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {doc.sections.map(section => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={scrollTo(section.id)}
                  className="flex items-baseline gap-2 text-sm text-white/60 hover:text-cyan-200 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300/70 shrink-0 translate-y-[-1px]" />
                  {section.heading}
                </a>
              ))}
            </div>
          </nav>

          {/* ── Sections ──────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">
            {doc.sections.map(section => (
              <section
                key={section.id}
                id={section.id}
                className="rounded-2xl p-6 md:p-7 scroll-mt-28"
                style={glassCard}
              >
                <h2 className="text-lg font-bold text-white mb-4">{section.heading}</h2>
                <div className="flex flex-col gap-3">
                  {section.blocks.map((block, i) => {
                    if (block.type === 'sub') {
                      return (
                        <h3
                          key={i}
                          className="text-[13px] font-semibold text-white/85 tracking-wide mt-2"
                        >
                          {block.text}
                        </h3>
                      );
                    }
                    if (block.type === 'bullets') {
                      return (
                        <ul key={i} className="flex flex-col gap-2 mt-1">
                          {block.items.map((item, j) => (
                            <li key={j} className="flex gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300/60 shrink-0 mt-[7px]" />
                              <p className="text-sm text-white/65 leading-relaxed">{item}</p>
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={i} className="text-sm text-white/65 leading-relaxed">
                        {block.text}
                      </p>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
