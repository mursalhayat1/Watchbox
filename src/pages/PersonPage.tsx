import { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Calendar, User, ExternalLink, Film, Tv, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/layouts/Navbar';
import Footer from '@/components/layouts/Footer';
import { GlassButton, GlassFilterDef } from '@/components/ui/liquid-glass';
import Silk from '@/components/ui/Silk';
import { useAsync } from '@/hooks/useTMDB';
import { useAuth } from '@/contexts/AuthContext';
import { getPersonDetails, tmdbImageUrl, type PersonCredit } from '@/services/tmdb';
import { isFavoriteActor, toggleFavoriteActor } from '@/lib/supabase/actorFavorites';
import PageMeta from '@/components/common/PageMeta';
import { generatePersonMetadata } from '@/lib/seo';

// ── helpers ───────────────────────────────────────────────────────────────────
function calcAge(birthday: string, deathday?: string | null) {
  const end = deathday ? new Date(deathday) : new Date();
  const birth = new Date(birthday);
  let age = end.getFullYear() - birth.getFullYear();
  const m = end.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
  return age;
}

function genderLabel(g: number) {
  if (g === 1) return 'Female';
  if (g === 2) return 'Male';
  if (g === 3) return 'Non-binary';
  return 'Unknown';
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ── Credit card in filmography grid ──────────────────────────────────────────
function CreditCard({ credit }: { credit: PersonCredit }) {
  const title = credit.title ?? credit.name ?? 'Unknown';
  const year = (credit.release_date ?? credit.first_air_date ?? '').slice(0, 4);
  const poster = tmdbImageUrl(credit.poster_path, 'w342');
  const href = `/detail/${credit.media_type}/${credit.id}`;

  return (
    <Link to={href} className="group flex flex-col">
      {/* Poster */}
      <div className="relative w-full rounded-xl overflow-hidden bg-white/6 border border-white/8"
        style={{ aspectRatio: '2/3' }}>
        {poster ? (
          <img src={poster} alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {credit.media_type === 'tv'
              ? <Tv className="w-8 h-8 text-white/20" />
              : <Film className="w-8 h-8 text-white/20" />}
          </div>
        )}
        {/* Year badge */}
        {year && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(0,0,0,0.65)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)' }}>
            {year}
          </span>
        )}
      </div>
      {/* Title + role */}
      <p className="mt-1.5 text-xs font-semibold text-white/90 truncate leading-snug">{title}</p>
      {credit.character && (
        <p className="text-[11px] text-white/45 truncate">{credit.character}</p>
      )}
      {credit.job && !credit.character && (
        <p className="text-[11px] text-white/45 truncate">{credit.job}</p>
      )}
    </Link>
  );
}

// ── Liquid-glass surface for scroll arrows ────────────────────────────────────
const glassArrow: React.CSSProperties = {
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)',
  border: '1px solid rgba(255,255,255,0.22)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.28)',
};

// ── "Known For" horizontal row — large landscape cards ────────────────────────
function KnownForRow({ credits }: { credits: PersonCredit[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -(el.clientWidth * 0.75) : el.clientWidth * 0.75, behavior: 'smooth' });
  };

  // Pick top 8: prefer items with a poster, sorted by vote_average desc
  const featured = [...credits]
    .filter(c => c.poster_path)
    .sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0))
    .slice(0, 8);

  if (featured.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base md:text-lg font-bold text-white">Known For</h2>
      </div>

      {/* Hover-reveal side arrows */}
      <div className="relative group/kfr">
        {/* ← Left */}
        <button
          onClick={() => scroll('left')} disabled={!canLeft} aria-label="Scroll left"
          className="absolute left-0 top-0 bottom-0 z-10 w-14 flex items-center justify-center
            opacity-0 group-hover/kfr:opacity-100 disabled:!opacity-0
            transition-opacity duration-200 pointer-events-none group-hover/kfr:pointer-events-auto"
          style={{ background: 'linear-gradient(to right, rgba(8,22,25,0.85) 0%, transparent 100%)' }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={glassArrow}>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </button>

        {/* Scroll row — large landscape cards matching the reference */}
        <div ref={scrollRef} onScroll={onScroll}
          className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {featured.map(credit => {
            const title = credit.title ?? credit.name ?? '';
            const year = (credit.release_date ?? credit.first_air_date ?? '').slice(0, 4);
            const poster = tmdbImageUrl(credit.poster_path, 'w500');
            return (
              <Link
                key={`${credit.media_type}-${credit.id}`}
                to={`/detail/${credit.media_type}/${credit.id}`}
                className="shrink-0 w-[200px] md:w-[240px] group"
              >
                {/* Poster — 2:3 portrait, large */}
                <div className="relative w-full rounded-2xl overflow-hidden border border-white/10"
                  style={{ aspectRatio: '2/3', background: 'rgba(255,255,255,0.06)' }}>
                  {poster && (
                    <img src={poster} alt={title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  )}
                  {/* Bottom gradient + title overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-3"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }}>
                    {year && (
                      <span className="text-[10px] font-semibold text-white/60 mb-0.5">{year}</span>
                    )}
                    <p className="text-sm font-bold text-white leading-snug text-balance">{title}</p>
                    {credit.character && (
                      <p className="text-[11px] text-white/55 mt-0.5 truncate">{credit.character}</p>
                    )}
                  </div>
                  {/* Media type badge top-right */}
                  <span className="absolute top-2 right-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                    style={{ background: 'rgba(0,0,0,0.60)', color: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(4px)' }}>
                    {credit.media_type === 'tv' ? 'TV' : 'Film'}
                  </span>
                </div>
              </Link>
            );
          })}
          <div className="shrink-0 w-4 md:w-6" aria-hidden="true" />
        </div>

        {/* → Right */}
        <button
          onClick={() => scroll('right')} disabled={!canRight} aria-label="Scroll right"
          className="absolute right-0 top-0 bottom-0 z-10 w-14 flex items-center justify-center
            opacity-0 group-hover/kfr:opacity-100 disabled:!opacity-0
            transition-opacity duration-200 pointer-events-none group-hover/kfr:pointer-events-auto"
          style={{ background: 'linear-gradient(to left, rgba(8,22,25,0.85) 0%, transparent 100%)' }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={glassArrow}>
            <ChevronRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </section>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="relative min-h-screen bg-[#050a0e] flex flex-col overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Silk color="#0e7490" speed={3} scale={1.3} noiseIntensity={1.1} rotation={0.25} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(160deg, rgba(0,18,26,0.82) 0%, rgba(0,12,20,0.88) 40%, rgba(0,8,16,0.92) 100%)',
        }} />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 px-4 md:px-8 py-8 max-w-screen-xl mx-auto w-full">
          <div className="flex gap-8 mt-4">
            <div className="shrink-0 w-[160px] h-[240px] rounded-2xl bg-white/8 animate-pulse" />
            <div className="flex-1 space-y-3 pt-4">
              <div className="h-8 w-48 bg-white/8 rounded animate-pulse" />
              <div className="h-4 w-24 bg-white/6 rounded animate-pulse" />
              <div className="h-4 w-full max-w-sm bg-white/6 rounded animate-pulse" />
              <div className="h-4 w-3/4 max-w-xs bg-white/6 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PersonPage() {
  const { id } = useParams<{ id: string }>();
  const personId = Number(id);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'movie' | 'tv'>('all');
  const [actorFavorited, setActorFavorited] = useState(false);
  const [actorFavBusy, setActorFavBusy] = useState(false);
  const { user } = useAuth();

  const { data: person, loading, error } = useAsync(
    () => getPersonDetails(personId),
    [personId]
  );

  // Load initial favorite state
  useEffect(() => {
    if (!user || !personId) return;
    isFavoriteActor(personId).then(setActorFavorited).catch(() => {});
  }, [user, personId]);

  const handleActorFavorite = useCallback(async () => {
    if (!user) { toast.error('Sign in to save favorites'); return; }
    if (!person) return;
    setActorFavBusy(true);
    try {
      const next = await toggleFavoriteActor({
        person_id: person.id,
        name: person.name,
        profile_path: person.profile_path ?? null,
        known_for_department: person.known_for_department ?? null,
      });
      setActorFavorited(next);
      toast.success(next ? `${person.name} added to favorites` : `${person.name} removed from favorites`);
    } catch {
      toast.error('Failed to update favorite');
    } finally {
      setActorFavBusy(false);
    }
  }, [user, person]);

  if (loading) return <LoadingSkeleton />;

  if (error || !person) {
    return (
      <div className="relative min-h-screen bg-[#050a0e] flex flex-col overflow-x-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Silk color="#0e7490" speed={3} scale={1.3} noiseIntensity={1.1} rotation={0.25} />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(160deg, rgba(0,18,26,0.82) 0%, rgba(0,12,20,0.88) 40%, rgba(0,8,16,0.92) 100%)',
          }} />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <p className="text-white/60 text-lg">Could not load this person.</p>
              <Link to="/" className="text-white/40 hover:text-white text-sm underline">← Go back home</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filmography — deduplicate by id, sort by date desc
  const allCredits: PersonCredit[] = [
    ...(person.combined_credits?.cast ?? []),
    ...(person.combined_credits?.crew ?? []),
  ];
  const seen = new Set<number>();
  const dedupedCredits = allCredits
    .filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    })
    .sort((a, b) => {
      const da = a.release_date ?? a.first_air_date ?? '';
      const db = b.release_date ?? b.first_air_date ?? '';
      return db.localeCompare(da);
    });

  const movieCount = dedupedCredits.filter(c => c.media_type === 'movie').length;
  const tvCount = dedupedCredits.filter(c => c.media_type === 'tv').length;

  const filteredCredits = filterTab === 'all'
    ? dedupedCredits
    : dedupedCredits.filter(c => c.media_type === filterTab);

  const profileImg = tmdbImageUrl(person.profile_path, 'w342');
  const imdbId = person.imdb_id ?? person.external_ids?.imdb_id;

  // Bio truncation
  const BIO_LIMIT = 400;
  const shortBio = person.biography.length > BIO_LIMIT
    ? person.biography.slice(0, BIO_LIMIT) + '…'
    : person.biography;

  const seo = generatePersonMetadata(person, `/person/${person.id}`);

  return (
    <div className="relative min-h-screen bg-[#050a0e] flex flex-col overflow-x-hidden">
      <PageMeta seo={seo} />
      <GlassFilterDef />

      {/* ── Silk background — same as HomePage / DiscoverPage ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Silk color="#0e7490" speed={3} scale={1.3} noiseIntensity={1.1} rotation={0.25} />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(160deg, rgba(0,18,26,0.82) 0%, rgba(0,12,20,0.88) 40%, rgba(0,8,16,0.92) 100%)',
        }} />
        {/* Subtle teal glow top-left */}
        <div className="absolute top-0 left-0 w-[500px] h-[350px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(14,116,144,0.18) 0%, transparent 70%)' }} />
      </div>

      {/* ── Page content ── */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 px-4 md:px-8 py-6 w-full max-w-screen-xl mx-auto">

          {/* ← Back */}
          <Link to={-1 as unknown as string}
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/90 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          {/* ── Hero row: photo + bio info ── */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10">

            {/* Profile photo */}
            <div className="shrink-0 w-[140px] md:w-[160px]">
              <div className="w-full rounded-2xl overflow-hidden border border-white/12 shadow-2xl"
                style={{ aspectRatio: '2/3', background: 'rgba(255,255,255,0.06)' }}>
                {profileImg ? (
                  <img src={profileImg} alt={person.name} className="w-full h-full object-cover object-top" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white/20" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Name + favourite */}
              <div className="flex items-start justify-between gap-4 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{person.name}</h1>
                <GlassButton
                  size="sm"
                  className="shrink-0 gap-1.5"
                  active={actorFavorited}
                  disabled={actorFavBusy}
                  onClick={handleActorFavorite}
                >
                  <Heart className={`w-3.5 h-3.5 ${actorFavorited ? 'fill-red-400 text-red-400' : ''}`} />
                  {actorFavorited ? 'Favorited' : 'Favorite'}
                </GlassButton>
              </div>

              {/* Department badge */}
              <p className="text-xs font-semibold tracking-widest uppercase text-white/45 mb-4">
                {person.known_for_department}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-6 mb-5">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{movieCount}</p>
                  <p className="text-[10px] uppercase tracking-wide text-white/40">Movies</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{tvCount}</p>
                  <p className="text-[10px] uppercase tracking-wide text-white/40">TV Shows</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{Math.round(person.popularity)}</p>
                  <p className="text-[10px] uppercase tracking-wide text-white/40">Popularity</p>
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2.5 mb-5 text-sm">
                {person.birthday && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 text-white/35 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/35 mb-0.5">Born</p>
                      <p className="text-white/80 text-sm">
                        {fmtDate(person.birthday)}
                        {!person.deathday && ` (${calcAge(person.birthday)} yrs)`}
                      </p>
                    </div>
                  </div>
                )}
                {person.place_of_birth && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-white/35 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/35 mb-0.5">Place of Birth</p>
                      <p className="text-white/80 text-sm">{person.place_of_birth}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <User className="w-3.5 h-3.5 text-white/35 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/35 mb-0.5">Gender</p>
                    <p className="text-white/80 text-sm">{genderLabel(person.gender)}</p>
                  </div>
                </div>
                {imdbId && (
                  <div className="flex items-start gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-white/35 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/35 mb-0.5">IMDb</p>
                      <a href={`https://www.imdb.com/name/${imdbId}`} target="_blank" rel="noopener noreferrer"
                        className="text-white/80 text-sm hover:text-white transition-colors">
                        {imdbId} ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Also known as */}
              {person.also_known_as.length > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] uppercase tracking-widest text-white/35 mb-2">Also Known As</p>
                  <div className="flex flex-wrap gap-2">
                    {person.also_known_as.slice(0, 8).map(alias => (
                      <span key={alias}
                        className="text-xs px-2.5 py-1 rounded-full border border-white/12"
                        style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}>
                        {alias}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Biography */}
              {person.biography && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/35 mb-2">Biography</p>
                  <p className="text-sm text-white/65 leading-relaxed">
                    {bioExpanded ? person.biography : shortBio}
                  </p>
                  {person.biography.length > BIO_LIMIT && (
                    <button onClick={() => setBioExpanded(v => !v)}
                      className="mt-1.5 text-xs text-white/40 hover:text-white/80 transition-colors">
                      {bioExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Known For — featured horizontal row ── */}
          <KnownForRow credits={dedupedCredits} />

          {/* ── Filmography ── */}
          <section>
            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base md:text-lg font-bold text-white">
                Filmography
                <span className="ml-2 text-sm font-normal text-white/40">{dedupedCredits.length} titles</span>
              </h2>

              {/* Filter tabs: All / Movies / TV */}
              <div className="flex items-center gap-1 rounded-full p-1"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}>
                {(['all', 'movie', 'tv'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className="text-xs font-semibold px-3 py-1 rounded-full transition-all duration-150"
                    style={filterTab === tab ? {
                      background: 'rgba(255,255,255,0.18)',
                      color: 'rgba(255,255,255,0.95)',
                      boxShadow: '0 1px 6px rgba(0,0,0,0.3)',
                    } : {
                      color: 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {tab === 'all' ? `All (${dedupedCredits.length})` : tab === 'movie' ? `Movies (${movieCount})` : `TV (${tvCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid — same card size as media cards: ~160px mobile, ~185px desktop */}
            <div className="grid gap-4"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
              {filteredCredits.map(credit => (
                <CreditCard key={`${credit.media_type}-${credit.id}`} credit={credit} />
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
