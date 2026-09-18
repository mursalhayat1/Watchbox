/**
 * SEO utility library for WatchBox
 * Generates dynamic metadata for movies, TV shows, people, genres, and pages.
 *
 * Architecture note: WatchBox is a Vite + React CSR SPA using react-helmet-async.
 * All metadata is injected into <head> at runtime via Helmet.
 * TMDB API key lives only in VITE_TMDB_API_KEY — never exposed in meta tags.
 */

import type { MovieDetails, PersonDetails } from '@/services/tmdb';

// ── Site constants ─────────────────────────────────────────────────────────────
export const SITE_NAME = 'WatchBox';
export const SITE_DESCRIPTION =
  'Discover, track, and organise movies and TV shows you love. Explore trending titles, browse by genre, and build your personal watchlist on WatchBox.';
export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') ??
  (import.meta.env.PROD ? 'https://watchbox.app' : 'http://localhost:5173');

/** Absolute fallback OG image (served from /public) */
export const FALLBACK_OG_IMAGE = `${SITE_URL}/images/og-fallback.jpg`;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Clamp + strip undefined/null/NaN from any string-like value. */
export function safe(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  const s = String(value).trim();
  if (s === 'undefined' || s === 'null' || s === 'NaN' || s === '[object Object]') return fallback;
  return s;
}

/** Truncate to max chars, appending "…" if cut. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}

/** Build an absolute canonical URL. Strips query params and trailing slash. */
export function canonicalUrl(path: string): string {
  const clean = path.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
  return `${SITE_URL}${clean}`;
}

/** Build a TMDB image URL for use in meta tags (always absolute). */
export function metaImage(
  path: string | null | undefined,
  size: 'w780' | 'w1280' | 'original' = 'w1280',
): string {
  if (!path) return FALLBACK_OG_IMAGE;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/** Extract 4-digit year from a TMDB date string. */
export function year(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return dateStr.slice(0, 4);
}

/** Format a language code to its English name. */
export function languageName(code: string | null | undefined): string {
  if (!code) return '';
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

/** Safely join array items, filtering blanks. */
export function joinList(items: (string | undefined | null)[], sep = ', '): string {
  return items.filter(Boolean).join(sep);
}

// ── Movie metadata ─────────────────────────────────────────────────────────────

export interface PageSeoData {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  ogImageAlt: string;
  ogType: 'website' | 'video.movie' | 'video.tv_show' | 'profile';
  robots: string;
  jsonLd: Record<string, unknown> | null;
}

export function generateMovieMetadata(
  movie: MovieDetails,
  path: string,
): PageSeoData {
  const title = safe(movie.title ?? movie.name, 'Unknown Title');
  const releaseYear = year(movie.release_date ?? movie.first_air_date);
  const genres = (movie.genres ?? []).map(g => safe(g.name)).filter(Boolean);
  const rating = movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null;
  const director = movie.credits?.crew?.find(c => c.job === 'Director');
  const cast = (movie.credits?.cast ?? []).slice(0, 3).map(c => safe(c.name)).filter(Boolean);
  const overview = safe(movie.overview);
  const runtime = movie.runtime ? ` ${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m.` : '';
  const lang = languageName(movie.original_language);

  // Build natural description
  const parts: string[] = [];
  if (overview) parts.push(truncate(overview, 160));
  const meta: string[] = [];
  if (releaseYear) meta.push(releaseYear);
  if (genres.length) meta.push(genres.slice(0, 3).join('/'));
  if (rating) meta.push(`⭐ ${rating}`);
  if (runtime) meta.push(runtime.trim());
  if (director) meta.push(`Dir. ${safe(director.name)}`);
  if (cast.length) meta.push(`With ${joinList(cast)}`);
  if (lang) meta.push(lang);
  if (meta.length) parts.push(meta.join(' · '));

  const description = truncate(parts.join(' — '), 200);
  const fullTitle = releaseYear
    ? `${title} (${releaseYear}) – ${SITE_NAME}`
    : `${title} – ${SITE_NAME}`;

  const ogImage = metaImage(movie.backdrop_path ?? movie.poster_path);
  const ogImageAlt = `${title}${releaseYear ? ` (${releaseYear})` : ''} backdrop`;

  // JSON-LD: Movie schema
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: title,
    ...(releaseYear ? { datePublished: movie.release_date ?? releaseYear } : {}),
    ...(overview ? { description: truncate(overview, 300) } : {}),
    ...(movie.poster_path ? { image: metaImage(movie.poster_path, 'w780') } : {}),
    ...(rating && movie.vote_count > 100
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating,
            ratingCount: movie.vote_count,
            bestRating: '10',
            worstRating: '1',
          },
        }
      : {}),
    ...(genres.length ? { genre: genres } : {}),
    ...(director ? { director: { '@type': 'Person', name: safe(director.name) } } : {}),
    ...(cast.length
      ? { actor: cast.map(name => ({ '@type': 'Person', name })) }
      : {}),
    url: canonicalUrl(path),
    sameAs: [
      ...(movie.imdb_id ? [`https://www.imdb.com/title/${movie.imdb_id}`] : []),
      ...(movie.homepage ? [movie.homepage] : []),
    ].filter(Boolean),
  };

  return {
    title: fullTitle,
    description,
    canonical: canonicalUrl(path),
    ogImage,
    ogImageAlt,
    ogType: 'video.movie',
    robots: 'index, follow',
    jsonLd,
  };
}

// ── TV metadata ────────────────────────────────────────────────────────────────

export function generateTVMetadata(
  show: MovieDetails,
  path: string,
): PageSeoData {
  const title = safe(show.name ?? show.title, 'Unknown Show');
  const releaseYear = year(show.first_air_date ?? show.release_date);
  const genres = (show.genres ?? []).map(g => safe(g.name)).filter(Boolean);
  const rating = show.vote_average > 0 ? show.vote_average.toFixed(1) : null;
  const seasons = show.number_of_seasons;
  const cast = (show.credits?.cast ?? []).slice(0, 3).map(c => safe(c.name)).filter(Boolean);
  const overview = safe(show.overview);

  const parts: string[] = [];
  if (overview) parts.push(truncate(overview, 160));
  const meta: string[] = [];
  if (releaseYear) meta.push(releaseYear);
  if (genres.length) meta.push(genres.slice(0, 3).join('/'));
  if (rating) meta.push(`⭐ ${rating}`);
  if (seasons) meta.push(`${seasons} season${seasons > 1 ? 's' : ''}`);
  if (cast.length) meta.push(`With ${joinList(cast)}`);
  if (meta.length) parts.push(meta.join(' · '));

  const description = truncate(parts.join(' — '), 200);
  const fullTitle = `${title} – TV Series – ${SITE_NAME}`;
  const ogImage = metaImage(show.backdrop_path ?? show.poster_path);
  const ogImageAlt = `${title} TV series backdrop`;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: title,
    ...(releaseYear ? { startDate: show.first_air_date ?? releaseYear } : {}),
    ...(overview ? { description: truncate(overview, 300) } : {}),
    ...(show.poster_path ? { image: metaImage(show.poster_path, 'w780') } : {}),
    ...(rating && show.vote_count > 100
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating,
            ratingCount: show.vote_count,
            bestRating: '10',
            worstRating: '1',
          },
        }
      : {}),
    ...(genres.length ? { genre: genres } : {}),
    ...(seasons ? { numberOfSeasons: seasons } : {}),
    ...(cast.length
      ? { actor: cast.map(name => ({ '@type': 'Person', name })) }
      : {}),
    url: canonicalUrl(path),
  };

  return {
    title: fullTitle,
    description,
    canonical: canonicalUrl(path),
    ogImage,
    ogImageAlt,
    ogType: 'video.tv_show',
    robots: 'index, follow',
    jsonLd,
  };
}

// ── Person metadata ────────────────────────────────────────────────────────────

export function generatePersonMetadata(
  person: PersonDetails,
  path: string,
): PageSeoData {
  const name = safe(person.name, 'Unknown Person');
  const dept = safe(person.known_for_department, 'Acting');
  const bio = safe(person.biography);
  const knownFor = (person.combined_credits?.cast ?? [])
    .filter(c => (c.vote_average ?? 0) > 5)
    .sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0))
    .slice(0, 4)
    .map(c => safe(c.title ?? c.name))
    .filter(Boolean);

  const descParts: string[] = [`${name} is a ${dept} professional.`];
  if (bio) descParts.push(truncate(bio, 100));
  if (knownFor.length) descParts.push(`Known for: ${joinList(knownFor)}.`);

  const description = truncate(descParts.join(' '), 200);
  const fullTitle = `${name} – Movies & TV Shows – ${SITE_NAME}`;
  const ogImage = person.profile_path
    ? metaImage(person.profile_path, 'w780')
    : FALLBACK_OG_IMAGE;
  const ogImageAlt = `${name} profile photo`;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    ...(dept ? { jobTitle: dept } : {}),
    ...(bio ? { description: truncate(bio, 300) } : {}),
    ...(person.profile_path ? { image: metaImage(person.profile_path, 'w780') } : {}),
    ...(person.birthday ? { birthDate: person.birthday } : {}),
    ...(person.place_of_birth ? { birthPlace: person.place_of_birth } : {}),
    url: canonicalUrl(path),
    sameAs: [
      ...(person.imdb_id ? [`https://www.imdb.com/name/${person.imdb_id}`] : []),
      ...(person.homepage ? [person.homepage] : []),
    ].filter(Boolean),
  };

  return {
    title: fullTitle,
    description,
    canonical: canonicalUrl(path),
    ogImage,
    ogImageAlt,
    ogType: 'profile',
    robots: 'index, follow',
    jsonLd,
  };
}

// ── Genre metadata ─────────────────────────────────────────────────────────────

export function generateGenreMetadata(
  genreName: string,
  mediaType: 'movie' | 'tv' | 'all',
  path: string,
): PageSeoData {
  const typeLabel =
    mediaType === 'movie' ? 'Movies' : mediaType === 'tv' ? 'TV Shows' : 'Movies & TV Shows';
  const fullTitle = `${genreName} ${typeLabel} – ${SITE_NAME}`;
  const description = truncate(
    `Browse the best ${genreName.toLowerCase()} ${typeLabel.toLowerCase()} on WatchBox. Discover trending titles, hidden gems, and top-rated picks updated regularly.`,
    200,
  );

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: fullTitle,
    description,
    url: canonicalUrl(path),
  };

  return {
    title: fullTitle,
    description,
    canonical: canonicalUrl(path),
    ogImage: FALLBACK_OG_IMAGE,
    ogImageAlt: `${genreName} ${typeLabel} on ${SITE_NAME}`,
    ogType: 'website',
    robots: 'index, follow',
    jsonLd,
  };
}

// ── Homepage metadata ──────────────────────────────────────────────────────────

export function generateHomepageMetadata(): PageSeoData {
  const title = `${SITE_NAME} – Discover Movies & TV Shows`;
  const description = SITE_DESCRIPTION;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return {
    title,
    description,
    canonical: canonicalUrl('/'),
    ogImage: FALLBACK_OG_IMAGE,
    ogImageAlt: `${SITE_NAME} – Discover Movies & TV Shows`,
    ogType: 'website',
    robots: 'index, follow',
    jsonLd,
  };
}

// ── Static page metadata ───────────────────────────────────────────────────────

export function generateStaticMetadata(opts: {
  title: string;
  description: string;
  path: string;
  robots?: string;
  ogType?: PageSeoData['ogType'];
}): PageSeoData {
  return {
    title: `${opts.title} – ${SITE_NAME}`,
    description: opts.description,
    canonical: canonicalUrl(opts.path),
    ogImage: FALLBACK_OG_IMAGE,
    ogImageAlt: `${opts.title} on ${SITE_NAME}`,
    ogType: opts.ogType ?? 'website',
    robots: opts.robots ?? 'index, follow',
    jsonLd: null,
  };
}

// ── noindex helper ─────────────────────────────────────────────────────────────

/** Metadata for pages that must never appear in search results. */
export function noindexMetadata(title: string, path: string): PageSeoData {
  return {
    title: `${title} – ${SITE_NAME}`,
    description: '',
    canonical: canonicalUrl(path),
    ogImage: FALLBACK_OG_IMAGE,
    ogImageAlt: SITE_NAME,
    ogType: 'website',
    robots: 'noindex, nofollow',
    jsonLd: null,
  };
}
