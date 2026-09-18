import { Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="hidden md:block bg-background border-t border-border/50 mt-16">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
            <Film className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-primary">Reel</span>
            <span className="text-foreground">Scout</span>
          </span>
        </Link>
        <p className="text-xs text-muted-foreground text-center max-w-md">
          Movie and TV data provided by{' '}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            The Movie Database (TMDB)
          </a>
          . Not endorsed or certified by TMDB.
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link to="/discover" className="hover:text-foreground transition-colors">Movies</Link>
          <Link to="/discover" className="hover:text-foreground transition-colors">TV Shows</Link>
        </div>
      </div>
    </footer>
  );
}
