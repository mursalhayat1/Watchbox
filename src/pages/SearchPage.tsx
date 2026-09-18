import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import MovieCard from '@/components/movie/MovieCard';
import MovieCardSkeleton from '@/components/movie/MovieCardSkeleton';
import { Input } from '@/components/ui/input';
import { searchMulti } from '@/services/tmdb';
import type { Movie } from '@/services/tmdb';
import PageMeta from '@/components/common/PageMeta';
import { generateStaticMetadata } from '@/lib/seo';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchMulti(q);
      setResults(data.results.filter((m) => m.poster_path));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Run search from URL param on mount
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); doSearch(q); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
    doSearch(query);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PageMeta seo={generateStaticMetadata({
        title: 'Search',
        description: 'Search for movies, TV shows, and actors on WatchBox. Find exactly what you want to watch next.',
        path: '/search',
        robots: 'noindex, follow',
      })} />
      <Navbar />

      <main className="pt-14 flex-1 max-w-screen-2xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Search</h1>
        </div>

        {/* Search input */}
        <form onSubmit={handleSubmit} className="flex gap-3 mb-8 max-w-xl">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies & TV shows..."
            className="bg-secondary border-border text-foreground placeholder:text-muted-foreground flex-1"
            autoFocus
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Search className="w-4 h-4" /> Search
          </button>
        </form>

        {/* Results */}
        {loading && (
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
            {Array.from({ length: 16 }).map((_, i) => <MovieCardSkeleton key={i} />)}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No results found for &ldquo;{query}&rdquo;</p>
            <p className="text-sm text-muted-foreground mt-2">Try a different search term</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-4">{results.length} results for &ldquo;{query}&rdquo;</p>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-3">
              {results.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  mediaType={movie.media_type === 'tv' ? 'tv' : 'movie'}
                />
              ))}
            </div>
          </>
        )}

        {!searched && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Search for movies and TV shows</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
