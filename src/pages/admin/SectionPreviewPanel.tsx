/**
 * SectionPreviewPanel — live preview of a section's resolved content.
 */
import { useState, useEffect, useCallback } from 'react';
import { Star, Film, Tv, RefreshCw, Search, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayout from '@/components/admin/AdminLayout';
import type { Section } from '@/lib/supabase/sections';
import type { Movie } from '@/services/tmdb';
import { tmdbImageUrl, tmdbBackdropUrl } from '@/services/tmdb';
import { previewSection } from '@/services/sectionResolver';
import { getSection } from '@/lib/supabase/sections';
import { useParams } from 'react-router-dom';

// ── Preview card ──────────────────────────────────────────────────────────────
function PreviewCard({ movie }: { movie: Movie }) {
  const [imgErr, setImgErr] = useState(false);
  const title = movie.title ?? movie.name ?? 'Unknown';
  const year  = (movie.release_date ?? movie.first_air_date ?? '').slice(0, 4);
  const img   = !imgErr
    ? (movie.backdrop_path
        ? tmdbBackdropUrl(movie.backdrop_path)
        : movie.poster_path
          ? tmdbImageUrl(movie.poster_path, 'w342')
          : null)
    : null;
  const type  = movie.media_type === 'tv' ? 'TV' : 'Movie';

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card group cursor-default">
      <div className="relative aspect-[16/9] bg-muted">
        {img ? (
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <Film className="w-8 h-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-foreground truncate">{title}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">{type}</Badge>
          {year && <span className="text-[10px] text-muted-foreground">{year}</span>}
          {movie.vote_average > 0 && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 ml-auto">
              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
              {movie.vote_average.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Inline panel (used inside SectionBuilder preview tab) ─────────────────────
export function SectionPreviewPanel({ section }: { section: Section }) {
  const [movies, setMovies]   = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [ran, setRan]         = useState(false);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await previewSection(section);
      setMovies(result);
      setRan(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Preview failed');
    } finally {
      setLoading(false);
    }
  }, [section]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />Live Preview
            </CardTitle>
            <CardDescription>
              Shows what this section will display using your current settings.
            </CardDescription>
          </div>
          <Button size="sm" onClick={run} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            {ran ? 'Refresh' : 'Run Preview'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!ran && !loading && (
          <div className="flex flex-col items-center py-12 gap-3 text-center">
            <Search className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Click "Run Preview" to see matching results.</p>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Fetching results…</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[16/9] w-full rounded-xl" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {ran && !loading && !error && (
          <>
            {/* Stats bar */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/40 border mb-4">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-bold text-foreground text-lg">{movies.length}</span>
                <span className="text-muted-foreground">results</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {movies.filter(m => (m.media_type ?? 'movie') === 'movie').length > 0 && (
                  <span className="flex items-center gap-1">
                    <Film className="w-3 h-3" />
                    {movies.filter(m => (m.media_type ?? 'movie') === 'movie').length} movies
                  </span>
                )}
                {movies.filter(m => m.media_type === 'tv').length > 0 && (
                  <span className="flex items-center gap-1">
                    <Tv className="w-3 h-3" />
                    {movies.filter(m => m.media_type === 'tv').length} TV
                  </span>
                )}
              </div>
            </div>

            {movies.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-500/60" />
                <p className="text-sm font-medium text-foreground">No results found</p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Try loosening your filters, changing the sort method, or switching to a different content type.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {movies.map((m, i) => (
                  <PreviewCard key={`${m.id}_${i}`} movie={m} />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Standalone preview page ───────────────────────────────────────────────────
export default function SectionPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSection(id)
      .then(setSection)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AdminLayout breadcrumbs={[{ label: 'Sections', href: '/admin/sections' }, { label: 'Preview' }]}>
        <Skeleton className="h-96 w-full rounded-xl" />
      </AdminLayout>
    );
  }

  if (!section) {
    return (
      <AdminLayout breadcrumbs={[{ label: 'Sections', href: '/admin/sections' }, { label: 'Preview' }]}>
        <p className="text-muted-foreground">Section not found.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      breadcrumbs={[
        { label: 'Sections', href: '/admin/sections' },
        { label: section.name },
        { label: 'Preview' },
      ]}
      title={`Preview: ${section.name}`}
    >
      <SectionPreviewPanel section={section} />
    </AdminLayout>
  );
}
