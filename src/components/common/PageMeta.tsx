import { Helmet, HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { PageSeoData } from "@/lib/seo";
import { SITE_NAME, FALLBACK_OG_IMAGE } from "@/lib/seo";

/**
 * Full-featured SEO head injection via react-helmet-async.
 * Pass a PageSeoData object (from src/lib/seo.ts) for automatic
 * title, description, canonical, OG, Twitter/X, robots, and JSON-LD.
 */
const PageMeta = ({
  seo,
  // Legacy simple-API fallback — kept for backward compatibility
  title,
  description,
}: {
  seo?: PageSeoData;
  title?: string;
  description?: string;
}) => {
  // Resolve values: prefer typed PageSeoData, fall back to plain props
  const resolvedTitle       = seo?.title       ?? (title ? `${title} – ${SITE_NAME}` : SITE_NAME);
  const resolvedDescription = seo?.description ?? description ?? '';
  const resolvedCanonical   = seo?.canonical;
  const resolvedRobots      = seo?.robots      ?? 'index, follow';
  const resolvedOgImage     = seo?.ogImage     ?? FALLBACK_OG_IMAGE;
  const resolvedOgImageAlt  = seo?.ogImageAlt  ?? SITE_NAME;
  const resolvedOgType      = seo?.ogType      ?? 'website';
  const resolvedJsonLd      = seo?.jsonLd;

  return (
    <Helmet>
      {/* Core */}
      <title>{resolvedTitle}</title>
      {resolvedDescription && (
        <meta name="description" content={resolvedDescription} />
      )}
      <meta name="robots" content={resolvedRobots} />

      {/* Canonical */}
      {resolvedCanonical && (
        <link rel="canonical" href={resolvedCanonical} />
      )}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title"       content={resolvedTitle} />
      {resolvedDescription && (
        <meta property="og:description" content={resolvedDescription} />
      )}
      <meta property="og:type"  content={resolvedOgType} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:alt" content={resolvedOgImageAlt} />
      {resolvedCanonical && (
        <meta property="og:url" content={resolvedCanonical} />
      )}

      {/* Twitter / X */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={resolvedTitle} />
      {resolvedDescription && (
        <meta name="twitter:description" content={resolvedDescription} />
      )}
      <meta name="twitter:image"     content={resolvedOgImage} />
      <meta name="twitter:image:alt" content={resolvedOgImageAlt} />

      {/* JSON-LD structured data */}
      {resolvedJsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(resolvedJsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <TooltipProvider>
      {children}
    </TooltipProvider>
  </HelmetProvider>
);

export default PageMeta;
