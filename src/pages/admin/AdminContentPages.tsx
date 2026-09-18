import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  getTrending, getTopRated, searchMulti, searchPerson,
  tmdbImageUrl, type Movie,
} from '@/services/tmdb';
import { useDebounce } from '@/hooks/use-debounce';
import { useTMDBList } from '@/hooks/useTMDB';

type ContentTab = 'movies' | 'tv';

function ContentGrid({ items, loading, mediaType }: { items: Movie[]; loading: boolean; mediaType: ContentTab }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-lg" />)}
      </div>
    );
  }
  if (items.length === 0) {
    return <p className="text-center py-12 text-sm text-muted-foreground">No results found</p>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {items.map(item => (
        <Link
          key={item.id}
          to={`/detail/${mediaType}/${item.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative rounded-lg overflow-hidden bg-muted/40 hover:bg-muted/70 transition-colors"
        >
          {item.poster_path ? (
            <img
              src={tmdbImageUrl(item.poster_path, 'w185') ?? ''}
              alt={item.title || item.name}
              className="w-full aspect-[2/3] object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full aspect-[2/3] flex items-center justify-center bg-muted text-muted-foreground text-xs text-center p-2">
              {item.title || item.name}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
            <div className="min-w-0">
              <p className="text-white text-[10px] font-medium truncate">{item.title || item.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-black/60 text-white border-0">
                  ★ {item.vote_average?.toFixed(1)}
                </Badge>
                <ExternalLink className="w-2.5 h-2.5 text-white/80" />
              </div>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground p-1.5 truncate">{item.title || item.name}</p>
        </Link>
      ))}
    </div>
  );
}

function MoviesBrowser() {
  const [subTab, setSubTab]     = useState<'trending' | 'top_rated'>('trending');
  const [query, setQuery]       = useState('');
  const debouncedQuery          = useDebounce(query, 400);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searching, setSearching] = useState(false);

  const { movies: trending,  loading: tLoading }  = useTMDBList(() => getTrending('movie'));
  const { movies: topRated,  loading: trLoading }  = useTMDBList(() => getTopRated('movie'));

  useEffect(() => {
    if (!debouncedQuery.trim()) { setSearchResults([]); return; }
    setSearching(true);
    searchMulti(debouncedQuery)
      .then(r => setSearchResults(r.results ?? []))
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  const isSearching = debouncedQuery.trim().length > 0;
  const items = isSearching ? searchResults : (subTab === 'trending' ? trending : topRated);
  const loading = isSearching ? searching : (subTab === 'trending' ? tLoading : trLoading);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        <div className="relative flex-1 min-w-0 w-full md:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search movies…" value={query} onChange={e => setQuery(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        {!isSearching && (
          <Tabs value={subTab} onValueChange={v => setSubTab(v as typeof subTab)}>
            <TabsList className="h-8">
              <TabsTrigger value="trending" className="text-xs">Trending</TabsTrigger>
              <TabsTrigger value="top_rated" className="text-xs">Top Rated</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
      <ContentGrid items={items} loading={loading} mediaType="movies" />
    </div>
  );
}

function TVBrowser() {
  const [subTab, setSubTab]     = useState<'trending' | 'top_rated'>('trending');
  const [query, setQuery]       = useState('');
  const debouncedQuery          = useDebounce(query, 400);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searching, setSearching] = useState(false);

  const { movies: trending, loading: tLoading }  = useTMDBList(() => getTrending('tv'));
  const { movies: topRated, loading: trLoading }  = useTMDBList(() => getTopRated('tv'));

  useEffect(() => {
    if (!debouncedQuery.trim()) { setSearchResults([]); return; }
    setSearching(true);
    searchMulti(debouncedQuery)
      .then(r => setSearchResults((r.results ?? []).filter(m => m.media_type === 'tv')))
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  const isSearching = debouncedQuery.trim().length > 0;
  const items = isSearching ? searchResults : (subTab === 'trending' ? trending : topRated);
  const loading = isSearching ? searching : (subTab === 'trending' ? tLoading : trLoading);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
        <div className="relative flex-1 min-w-0 w-full md:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search TV shows…" value={query} onChange={e => setQuery(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        {!isSearching && (
          <Tabs value={subTab} onValueChange={v => setSubTab(v as typeof subTab)}>
            <TabsList className="h-8">
              <TabsTrigger value="trending" className="text-xs">Trending</TabsTrigger>
              <TabsTrigger value="top_rated" className="text-xs">Top Rated</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>
      <ContentGrid items={items} loading={loading} mediaType="tv" />
    </div>
  );
}

function ActorsBrowser() {
  const [query, setQuery]                         = useState('');
  const debouncedQuery                            = useDebounce(query, 400);
  const [results, setResults]   = useState<import('@/services/tmdb').PersonSearchResult[]>([]);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }
    setLoading(true);
    searchPerson(debouncedQuery)
      .then(r => setResults((r.results ?? []) as import('@/services/tmdb').PersonSearchResult[]))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="space-y-4">
      <div className="relative w-full md:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Search actors…" value={query} onChange={e => setQuery(e.target.value)} className="pl-8 h-8 text-sm" />
      </div>
      {!debouncedQuery.trim() ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Type a name to search for actors</p>
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-lg" />)}
        </div>
      ) : results.length === 0 ? (
        <p className="text-center py-8 text-sm text-muted-foreground">No actors found</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {results.map(actor => (
            <Link
              key={actor.id}
              to={`/person/${actor.id}`}
              className="group rounded-lg overflow-hidden bg-muted/40 hover:bg-muted/70 transition-colors"
            >
              {actor.profile_path ? (
                <img src={tmdbImageUrl(actor.profile_path, 'w185') ?? ''} alt={actor.name} className="w-full aspect-[2/3] object-cover" loading="lazy" />
              ) : (
                <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center text-muted-foreground text-2xl font-bold">
                  {(actor.name ?? '?').charAt(0)}
                </div>
              )}
              <div className="p-1.5">
                <p className="text-[10px] font-medium truncate">{actor.name}</p>
                <p className="text-[9px] text-muted-foreground truncate">{actor.known_for_department}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminMoviesPage() {
  return (
    <AdminLayout title="Movies" breadcrumbs={[{ label: 'Content' }, { label: 'Movies' }]}>
      <MoviesBrowser />
    </AdminLayout>
  );
}

export function AdminTVPage() {
  return (
    <AdminLayout title="TV Shows" breadcrumbs={[{ label: 'Content' }, { label: 'TV Shows' }]}>
      <TVBrowser />
    </AdminLayout>
  );
}

export function AdminActorsPage() {
  return (
    <AdminLayout title="Actors" breadcrumbs={[{ label: 'Content' }, { label: 'Actors' }]}>
      <ActorsBrowser />
    </AdminLayout>
  );
}
