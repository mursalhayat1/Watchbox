import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

/* Liquid-glass chip recipe (mirrors src/components/ui/liquid-glass.tsx) */
const glassChipStyle: CSSProperties = {
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.13), rgba(255,255,255,0.06))',
  border: '1px solid rgba(103, 232, 249, 0.28)',
  boxShadow:
    '0 4px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.22), inset 1px 0 0 rgba(255,255,255,0.10)',
};

const productLinks = [
  { label: 'Home',    to: '/' },
  { label: 'Discover', to: '/discover' },
  { label: 'Library',  to: '/library' },
  { label: 'Stats',    to: '/stats' },
];

/* Legal pages live at /privacy, /terms, /user-agreement (LegalShell + legalDocs).
   LoginPage links /privacy + /user-agreement too — keep the targets in sync.  */
const companyLinks = [
  { label: 'Privacy Policy',   to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'User Agreement',   to: '/user-agreement' },
  { label: 'About WatchBox',   to: '/about' },
];

const resourceLinks = [
  { label: 'TMDb',         href: 'https://www.themoviedb.org', external: true },
  { label: 'Help',         href: '#' },        // TODO: help page
  { label: 'Report Abuse', href: '#' },        // TODO: report-abuse flow
  { label: 'Contact',      href: '#' },        // TODO: contact page / email
];

const socialLinks = [
  { label: 'Facebook',  href: '#', Icon: Facebook },  // TODO: real handles
  { label: 'Instagram', href: '#', Icon: Instagram },
  { label: 'YouTube',   href: '#', Icon: Youtube },
  { label: 'LinkedIn',  href: '#', Icon: Linkedin },
];

const colHeading = 'text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-400/80';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="hidden md:block bg-background border-t border-cyan-400/20 mt-16">
      <div className="max-w-screen-2xl mx-auto px-6 py-12">
        {/* Brand block */}
        <div className="flex items-center gap-3">
          <img
            src="/images/logo/logo-glass.png"
            alt="WatchBox"
            className="w-9 h-9 object-contain"
            draggable={false}
          />
          <div>
            <span className="block text-foreground font-bold text-lg uppercase tracking-[0.18em] leading-none">
              Watchbox
            </span>
            <span className="block text-xs text-cyan-100/50 mt-1.5">
              Your personal media universe
            </span>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 mt-10">
          {/* Product */}
          <div>
            <h3 className={colHeading}>Product</h3>
            <ul className="space-y-1 mt-4">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="block py-1.5 text-sm text-cyan-100/60 hover:text-cyan-200 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className={colHeading}>Company</h3>
            <ul className="space-y-1 mt-4">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="block py-1.5 text-sm text-cyan-100/60 hover:text-cyan-200 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className={colHeading}>Resources</h3>
            <ul className="space-y-1 mt-4">
              {resourceLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    {...(l.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="block py-1.5 text-sm text-cyan-100/60 hover:text-cyan-200 transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className={colHeading}>Social</h3>
            <ul className="space-y-2.5 mt-4">
              {socialLinks.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    style={glassChipStyle}
                    className="flex items-center gap-2.5 w-max rounded-full pl-3 pr-4 py-1.5 text-sm text-cyan-50/85 hover:brightness-[1.08] transition-all"
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-cyan-300/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <p className="text-xs text-cyan-100/50">
            © {year} WatchBox. All rights reserved.
          </p>
          <p className="text-xs text-cyan-100/50">
            Media data provided by{' '}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 decoration-cyan-300/40 hover:text-cyan-200 transition-colors"
            >
              TMDb
            </a>
            . Not endorsed by TMDb.
          </p>
        </div>
      </div>
    </footer>
  );
}
