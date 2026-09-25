/**
 * SectionBuilder — multi-tab form for creating and editing sections.
 * Tabs: Basic → Content → Filters → Sorting → Manual/Hybrid → Display → Schedule → Preview → Publish
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ChevronLeft, ChevronRight, Save, Eye, Zap, BookOpen, Layers,
  Info, ListFilter, ArrowUpDown, Hand, Layout, Calendar, Rocket,
  X, GripVertical, Search, Loader2, Check,
} from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { SectionPreviewPanel } from './SectionPreviewPanel';
import {
  adminCreateSection, adminUpdateSection, getSection,
  SECTION_PRESETS,
  type Section, type SectionInsert, type SectionFilters,
  type SortBy, type LayoutType, type ContentType, type SectionType,
  type DisplayOptions, type PinnedItem, DEFAULT_DISPLAY_OPTIONS,
} from '@/lib/supabase/sections';
import { searchMulti, searchKeywords, tmdbImageUrl, type Movie } from '@/services/tmdb';
import { useDebounce } from '@/hooks/use-debounce';

// ── Zod schema ────────────────────────────────────────────────────────────────
const schema = z.object({
  name:           z.string().min(1, 'Name is required').max(100),
  description:    z.string().max(300).optional(),
  section_type:   z.enum(['dynamic', 'manual', 'hybrid']),
  content_type:   z.enum(['movie', 'tv', 'all']),
  status:         z.enum(['draft', 'published', 'scheduled', 'disabled', 'expired']),
  position:       z.number().min(0).max(9999),
  layout:         z.enum(['carousel','large_cards','small_cards','grid','compact_list','featured_carousel','hero_cards']),
  item_limit:     z.number().min(1).max(50),
  sort_by:        z.string(),
  sort_direction: z.enum(['asc', 'desc']),
  min_vote_count: z.number().nullable(),
  section_label:  z.string().max(80).optional(),
  view_all_link:  z.string().max(200).optional(),
  start_at:       z.string().optional().nullable(),
  end_at:         z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

// ── Defaults ──────────────────────────────────────────────────────────────────
const FORM_DEFAULTS: FormValues = {
  name:           '',
  description:    '',
  section_type:   'hybrid',
  content_type:   'all',
  status:         'draft',
  position:       100,
  layout:         'carousel',
  item_limit:     20,
  sort_by:        'trending_week',
  sort_direction: 'desc',
  min_vote_count: null,
  section_label:  '',
  view_all_link:  '',
  start_at:       null,
  end_at:         null,
};

// ── Tabs config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'basic',    label: 'Basic',     icon: Info },
  { id: 'content',  label: 'Content',   icon: Layers },
  { id: 'filters',  label: 'Filters',   icon: ListFilter },
  { id: 'sorting',  label: 'Sorting',   icon: ArrowUpDown },
  { id: 'manual',   label: 'Items',     icon: Hand },
  { id: 'display',  label: 'Display',   icon: Layout },
  { id: 'schedule', label: 'Schedule',  icon: Calendar },
  { id: 'preview',  label: 'Preview',   icon: Eye },
  { id: 'publish',  label: 'Publish',   icon: Rocket },
];

// ── Lookup constants ──────────────────────────────────────────────────────────
const GENRES_MOVIE = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' }, { id: 27, name: 'Horror' }, { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Sci-Fi' },
  { id: 10770, name: 'TV Movie' }, { id: 53, name: 'Thriller' }, { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];
const GENRES_TV = [
  { id: 10759, name: 'Action & Adventure' }, { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, { id: 10762, name: "Kids" },
  { id: 9648, name: 'Mystery' }, { id: 10763, name: 'News' }, { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' }, { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' }, { id: 10768, name: 'War & Politics' }, { id: 37, name: 'Western' },
];

const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }, { code: 'it', name: 'Italian' }, { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' }, { code: 'ja', name: 'Japanese' }, { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' }, { code: 'hi', name: 'Hindi' }, { code: 'ar', name: 'Arabic' },
  { code: 'tr', name: 'Turkish' }, { code: 'pl', name: 'Polish' }, { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' }, { code: 'da', name: 'Danish' }, { code: 'nb', name: 'Norwegian' },
];

const COUNTRIES = [
  { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' }, { code: 'DE', name: 'Germany' }, { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' }, { code: 'CA', name: 'Canada' }, { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' }, { code: 'KR', name: 'South Korea' }, { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' }, { code: 'BR', name: 'Brazil' }, { code: 'MX', name: 'Mexico' },
  { code: 'RU', name: 'Russia' }, { code: 'SE', name: 'Sweden' }, { code: 'DK', name: 'Denmark' },
  { code: 'NO', name: 'Norway' }, { code: 'TR', name: 'Turkey' }, { code: 'TH', name: 'Thailand' },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'popularity',       label: 'Most Popular' },
  { value: 'top_rated',        label: 'Top Rated' },
  { value: 'trending_today',   label: 'Trending Today' },
  { value: 'trending_week',    label: 'Trending This Week' },
  { value: 'trending_month',   label: 'Trending This Month' },
  { value: 'most_watched',     label: 'Most Watched' },
  { value: 'recently_added',   label: 'Recently Added' },
  { value: 'recently_updated', label: 'Recently Updated' },
  { value: 'newest_release',   label: 'Newest Release' },
  { value: 'oldest_release',   label: 'Oldest Release' },
  { value: 'upcoming',         label: 'Upcoming' },
  { value: 'highest_vote_count','label': 'Highest Vote Count' },
  { value: 'lowest_vote_count', 'label': 'Lowest Vote Count' },
  { value: 'az',               label: 'A-Z' },
  { value: 'za',               label: 'Z-A' },
  { value: 'random',           label: 'Random' },
  { value: 'relevance',        label: 'Relevance' },
];

const LAYOUT_OPTIONS: { value: LayoutType; label: string; desc: string }[] = [
  { value: 'carousel',          label: 'Horizontal Carousel',  desc: 'Scrollable row of cards' },
  { value: 'large_cards',       label: 'Large Cards',          desc: 'Big poster cards in a row' },
  { value: 'small_cards',       label: 'Small Cards',          desc: 'Compact cards grid' },
  { value: 'grid',              label: 'Grid',                 desc: 'Equal-size grid layout' },
  { value: 'compact_list',      label: 'Compact List',         desc: 'Dense list with minimal info' },
  { value: 'featured_carousel', label: 'Featured Carousel',    desc: 'Large hero card + scroll' },
  { value: 'hero_cards',        label: 'Hero + Cards',         desc: 'Full-width hero with sub-cards' },
];

const ITEM_LIMIT_OPTIONS = [5, 10, 15, 20, 30, 50];

const DATE_PRESETS = [
  { value: 'today',         label: 'Today' },
  { value: 'this_week',     label: 'This Week' },
  { value: 'this_month',    label: 'This Month' },
  { value: 'this_year',     label: 'This Year' },
  { value: 'last_7_days',   label: 'Last 7 Days' },
  { value: 'last_30_days',  label: 'Last 30 Days' },
  { value: 'last_90_days',  label: 'Last 90 Days' },
  { value: 'last_6_months', label: 'Last 6 Months' },
  { value: 'last_year',     label: 'Last Year' },
  { value: 'previous_year', label: 'Previous Year' },
  { value: 'last_x_days',   label: 'Last X Days' },
  { value: 'custom',        label: 'Custom Range' },
];

// ── Multi-value token input ───────────────────────────────────────────────────
function TokenList({
  items, onRemove, renderLabel,
}: {
  items: { id: number | string; name: string }[];
  onRemove: (id: number | string) => void;
  renderLabel?: (item: { id: number | string; name: string }) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <Badge key={item.id} variant="secondary" className="flex items-center gap-1 pl-2 pr-1.5 py-0.5">
          <span className="text-xs">{renderLabel ? renderLabel(item) : item.name}</span>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="hover:text-destructive transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}

// ── Genre picker ──────────────────────────────────────────────────────────────
function GenrePicker({
  contentType, included, excluded,
  onInclude, onExclude, onRemove,
}: {
  contentType: ContentType;
  included: number[]; excluded: number[];
  onInclude: (id: number) => void;
  onExclude: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  const allGenres = contentType === 'movie'
    ? GENRES_MOVIE
    : contentType === 'tv'
      ? GENRES_TV
      : [...new Map([...GENRES_MOVIE, ...GENRES_TV].map(g => [g.id, g])).values()];

  return (
    <div className="flex flex-wrap gap-1.5">
      {allGenres.map(g => {
        const inc = included.includes(g.id);
        const exc = excluded.includes(g.id);
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => {
              if (!inc && !exc) onInclude(g.id);
              else if (inc) { onRemove(g.id); onExclude(g.id); }
              else { onRemove(g.id); }
            }}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-colors border',
              inc  ? 'bg-primary/20 text-primary border-primary/30' :
              exc  ? 'bg-destructive/15 text-destructive border-destructive/30' :
                     'bg-muted/50 text-muted-foreground border-border hover:bg-muted',
            )}
          >
            {inc ? '✓ ' : exc ? '✕ ' : ''}{g.name}
          </button>
        );
      })}
      <p className="w-full text-[10px] text-muted-foreground mt-1">
        Click once = include (green), twice = exclude (red), three times = clear.
      </p>
    </div>
  );
}

// ── Language/Country picker ───────────────────────────────────────────────────
function ListPicker<T extends string>({
  all, included, excluded, onInclude, onExclude, onRemove,
}: {
  all: { code: T; name: string }[];
  included: T[]; excluded: T[];
  onInclude: (v: T) => void;
  onExclude: (v: T) => void;
  onRemove:  (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {all.map(item => {
        const inc = included.includes(item.code);
        const exc = excluded.includes(item.code);
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => {
              if (!inc && !exc) onInclude(item.code);
              else if (inc) { onRemove(item.code); onExclude(item.code); }
              else onRemove(item.code);
            }}
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium transition-colors border',
              inc  ? 'bg-primary/20 text-primary border-primary/30' :
              exc  ? 'bg-destructive/15 text-destructive border-destructive/30' :
                     'bg-muted/50 text-muted-foreground border-border hover:bg-muted',
            )}
          >
            {inc ? '✓ ' : exc ? '✕ ' : ''}{item.name}
          </button>
        );
      })}
      <p className="w-full text-[10px] text-muted-foreground mt-1">
        Click once = include (blue), twice = exclude (red), three times = clear.
      </p>
    </div>
  );
}

// ── Sortable pinned item row ──────────────────────────────────────────────────
function SortablePinnedItem({
  item, onRemove,
}: { item: PinnedItem; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `${item.media_type}:${item.tmdb_id}` });

  const img = item.poster_path ? tmdbImageUrl(item.poster_path, 'w92') : null;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2.5 p-2 rounded-lg border bg-card
        ${isDragging ? 'opacity-60 shadow-lg' : 'hover:bg-muted/40'}`}
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="touch-none text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      {img ? (
        <img src={img} alt={item.title} className="w-8 h-12 object-cover rounded shrink-0" />
      ) : (
        <div className="w-8 h-12 rounded bg-muted shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.title}</p>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 mt-0.5">
          {item.media_type === 'movie' ? 'Movie' : 'TV'}
        </Badge>
      </div>
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onRemove}>
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

// ── Title search for manual/hybrid ───────────────────────────────────────────
function TitleSearch({
  onAdd, excludeIds,
}: {
  onAdd: (item: PinnedItem) => void;
  excludeIds: Set<string>;
}) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const [results, setResults] = useState<Movie[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }
    setSearching(true);
    searchMulti(debouncedQuery)
      .then(r => setResults((r.results ?? []).filter(m =>
        m.media_type === 'movie' || m.media_type === 'tv'
      ).slice(0, 10)))
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  }, [debouncedQuery]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search movies or TV shows…"
          className="pl-9"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>
      {results.length > 0 && (
        <div className="border rounded-lg divide-y divide-border max-h-64 overflow-y-auto">
          {results.map(m => {
            const id = `${m.media_type}:${m.id}`;
            const added = excludeIds.has(id);
            const title = m.title ?? m.name ?? 'Unknown';
            const img = m.poster_path ? tmdbImageUrl(m.poster_path, 'w92') : null;
            return (
              <button
                key={id}
                type="button"
                disabled={added}
                onClick={() => {
                  onAdd({
                    tmdb_id:    m.id,
                    media_type: m.media_type as 'movie' | 'tv',
                    title,
                    poster_path: m.poster_path,
                  });
                  setQuery('');
                  setResults([]);
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 p-2 text-left hover:bg-muted/50 transition-colors',
                  added && 'opacity-40 cursor-not-allowed',
                )}
              >
                {img ? (
                  <img src={img} alt={title} className="w-8 h-12 object-cover rounded shrink-0" />
                ) : (
                  <div className="w-8 h-12 rounded bg-muted shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                      {m.media_type === 'tv' ? 'TV' : 'Movie'}
                    </Badge>
                    {(m.release_date ?? m.first_air_date) && (
                      <span className="text-[11px] text-muted-foreground">
                        {(m.release_date ?? m.first_air_date ?? '').slice(0, 4)}
                      </span>
                    )}
                  </div>
                </div>
                {added && <Check className="w-4 h-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Keyword search ────────────────────────────────────────────────────────────
function KeywordSearch({ onAdd, added }: {
  onAdd: (id: number, name: string) => void;
  added: Set<number>;
}) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [results, setResults] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }
    setLoading(true);
    searchKeywords(debouncedQuery)
      .then(r => setResults(r.results.slice(0, 8)))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search TMDB keywords…"
          className="pl-9 h-8 text-sm"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground animate-spin" />}
      </div>
      {results.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border bg-muted/30">
          {results.map(kw => (
            <button
              key={kw.id}
              type="button"
              disabled={added.has(kw.id)}
              onClick={() => { onAdd(kw.id, kw.name); setQuery(''); setResults([]); }}
              className={cn(
                'px-2 py-0.5 rounded text-xs border transition-colors',
                added.has(kw.id)
                  ? 'opacity-40 cursor-not-allowed bg-muted text-muted-foreground'
                  : 'bg-background hover:bg-primary/10 hover:border-primary/30',
              )}
            >
              {kw.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section form field group ──────────────────────────────────────────────────
function FieldGroup({ label, desc, children }: {
  label: string; desc?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        {desc && <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface SectionBuilderProps {
  mode: 'create' | 'edit';
}

export default function SectionBuilder({ mode }: SectionBuilderProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(mode === 'edit');

  // Filter state (separate from form — stored as JSON)
  const [filters, setFilters] = useState<SectionFilters>({});
  const [displayOpts, setDisplayOpts] = useState<DisplayOptions>(DEFAULT_DISPLAY_OPTIONS);
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
  const [excludedItems, setExcludedItems] = useState<PinnedItem[]>([]);

  // Local keywords state
  const [kwIncludeNames, setKwIncludeNames] = useState<Map<number, string>>(new Map());

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: FORM_DEFAULTS,
  });
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = form;
  const watchSectionType  = watch('section_type');
  const watchContentType  = watch('content_type');
  const watchSortBy       = watch('sort_by');
  const watchStatus       = watch('status');

  // ── Load existing section ─────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'edit' || !id) return;
    setLoading(true);
    getSection(id)
      .then(s => {
        if (!s) { toast.error('Section not found'); navigate('/admin/sections'); return; }
        setValue('name',           s.name);
        setValue('description',    s.description ?? '');
        setValue('section_type',   s.section_type);
        setValue('content_type',   s.content_type);
        setValue('status',         s.status);
        setValue('position',       s.position);
        setValue('layout',         s.layout);
        setValue('item_limit',     s.item_limit);
        setValue('sort_by',        s.sort_by);
        setValue('sort_direction', s.sort_direction);
        setValue('min_vote_count', s.min_vote_count);
        setValue('section_label',  s.section_label ?? '');
        setValue('view_all_link',  s.view_all_link ?? '');
        setValue('start_at',       s.start_at ?? null);
        setValue('end_at',         s.end_at ?? null);
        setFilters(s.filters ?? {});
        setDisplayOpts(s.display_options ?? DEFAULT_DISPLAY_OPTIONS);
        setPinnedItems(s.pinned_items ?? []);
        setExcludedItems(s.excluded_items ?? []);
      })
      .catch(() => toast.error('Failed to load section'))
      .finally(() => setLoading(false));
  }, [mode, id, setValue, navigate]);

  // ── Apply preset ──────────────────────────────────────────────────────────
  function applyPreset(key: string) {
    const preset = SECTION_PRESETS.find(p => p.key === key);
    if (!preset) return;
    const c = preset.config;
    if (c.name)         setValue('name',         c.name);
    if (c.content_type) setValue('content_type', c.content_type);
    if (c.section_type) setValue('section_type', c.section_type);
    if (c.sort_by)      setValue('sort_by',      c.sort_by as SortBy);
    if (c.layout)       setValue('layout',       c.layout as LayoutType);
    if (c.item_limit)   setValue('item_limit',   c.item_limit);
    if (c.min_vote_count != null) setValue('min_vote_count', c.min_vote_count);
    if (c.filters)      setFilters(c.filters);
    toast.success(`Preset "${preset.label}" applied`);
  }

  // ── Collect all state → SectionInsert ─────────────────────────────────────
  function collectPayload(values: FormValues): SectionInsert {
    return {
      ...values,
      description:    values.description || null,
      section_label:  values.section_label || null,
      view_all_link:  values.view_all_link || null,
      start_at:       values.start_at || null,
      end_at:         values.end_at || null,
      min_vote_count: values.min_vote_count,
      sort_by:        values.sort_by as SortBy,
      layout:         values.layout  as LayoutType,
      content_type:   values.content_type as ContentType,
      section_type:   values.section_type as SectionType,
      filters,
      display_options: displayOpts,
      pinned_items:   pinnedItems,
      excluded_items: excludedItems,
    };
  }

  // ── Save handlers ──────────────────────────────────────────────────────────
  const save = useCallback(async (values: FormValues, targetStatus?: 'draft' | 'published') => {
    setSaving(true);
    try {
      const payload = collectPayload(values);
      if (targetStatus) payload.status = targetStatus;
      if (mode === 'edit' && id) {
        await adminUpdateSection(id, payload);
        toast.success('Section updated');
      } else {
        await adminCreateSection(payload);
        toast.success('Section created');
      }
      navigate('/admin/sections');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save section');
    } finally {
      setSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, id, filters, displayOpts, pinnedItems, excludedItems, navigate]);

  // DnD sensors for pinned items
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handlePinnedDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = pinnedItems.map(p => `${p.media_type}:${p.tmdb_id}`);
    const oi = ids.indexOf(active.id as string);
    const ni = ids.indexOf(over.id as string);
    setPinnedItems(prev => arrayMove(prev, oi, ni));
  }

  // ── Filter helpers ────────────────────────────────────────────────────────
  function updateFilter<K extends keyof SectionFilters>(key: K, val: SectionFilters[K]) {
    setFilters(prev => ({ ...prev, [key]: val }));
  }

  const genreInclude = filters.genres?.include ?? [];
  const genreExclude = filters.genres?.exclude ?? [];

  function handleGenreInclude(id: number) {
    setFilters(prev => ({
      ...prev,
      genres: { include: [...(prev.genres?.include ?? []), id], exclude: prev.genres?.exclude ?? [] },
    }));
  }
  function handleGenreExclude(id: number) {
    setFilters(prev => ({
      ...prev,
      genres: { include: prev.genres?.include ?? [], exclude: [...(prev.genres?.exclude ?? []), id] },
    }));
  }
  function handleGenreRemove(id: number) {
    setFilters(prev => ({
      ...prev,
      genres: {
        include: (prev.genres?.include ?? []).filter(x => x !== id),
        exclude: (prev.genres?.exclude ?? []).filter(x => x !== id),
      },
    }));
  }

  const langInclude = (filters.languages?.include ?? []) as string[];
  const langExclude = (filters.languages?.exclude ?? []) as string[];

  const countryInclude = (filters.countries?.include ?? []) as string[];
  const countryExclude = (filters.countries?.exclude ?? []) as string[];

  if (loading) {
    return (
      <AdminLayout breadcrumbs={[{ label: 'Sections', href: '/admin/sections' }, { label: 'Loading…' }]}>
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  const tabIdx = TABS.findIndex(t => t.id === activeTab);

  // Build preview section from current form values
  const previewSection: Section = {
    id:             id ?? 'preview',
    name:           watch('name') || 'Preview',
    description:    watch('description') || null,
    section_type:   watch('section_type'),
    content_type:   watch('content_type'),
    status:         'published',
    position:       0,
    layout:         watch('layout') as LayoutType,
    item_limit:     watch('item_limit'),
    sort_by:        watch('sort_by') as SortBy,
    sort_direction: watch('sort_direction'),
    min_vote_count: watch('min_vote_count'),
    filters,
    display_options: displayOpts,
    pinned_items:   pinnedItems,
    excluded_items: excludedItems,
    section_label:  watch('section_label') || null,
    view_all_link:  watch('view_all_link') || null,
    start_at:       null,
    end_at:         null,
    created_at:     new Date().toISOString(),
    updated_at:     new Date().toISOString(),
  };

  return (
    <AdminLayout
      breadcrumbs={[
        { label: 'Sections', href: '/admin/sections' },
        { label: mode === 'edit' ? 'Edit Section' : 'New Section' },
      ]}
      title={mode === 'edit' ? 'Edit Section' : 'Create Section'}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/sections')}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={handleSubmit(v => save(v, 'draft'))}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
            Save Draft
          </Button>
          <Button
            size="sm"
            disabled={saving}
            onClick={handleSubmit(v => save(v, 'published'))}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Rocket className="w-4 h-4 mr-1.5" />}
            Publish
          </Button>
        </div>
      }
    >
      {/* Preset picker */}
      {mode === 'create' && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium">Start from a preset</span>
                <span className="text-xs text-muted-foreground">(optional, fully editable)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SECTION_PRESETS.map(p => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => applyPreset(p.key)}
                    className="px-2.5 py-1 rounded-full text-xs border border-border bg-muted/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(v => save(v))}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab bar */}
          <div className="overflow-x-auto mb-4">
            <TabsList className="inline-flex whitespace-nowrap h-9 gap-0.5">
              {TABS.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5 text-xs px-3">
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Basic ─────────────────────────────────────────────────────── */}
          <TabsContent value="basic" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <FieldGroup label="Section Name *">
                  <Input {...register('name')} placeholder="e.g. Trending This Week" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </FieldGroup>

                <FieldGroup label="Description" desc="Shown below the section title (optional)">
                  <Textarea {...register('description')} rows={2} placeholder="Short description…" />
                </FieldGroup>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldGroup label="Section Type">
                    <Controller
                      control={control}
                      name="section_type"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dynamic">
                              <div>
                                <p className="font-medium">Dynamic</p>
                                <p className="text-[11px] text-muted-foreground">Auto-generated from filter rules</p>
                              </div>
                            </SelectItem>
                            <SelectItem value="manual">
                              <div>
                                <p className="font-medium">Manual</p>
                                <p className="text-[11px] text-muted-foreground">Admin picks every title</p>
                              </div>
                            </SelectItem>
                            <SelectItem value="hybrid">
                              <div>
                                <p className="font-medium flex items-center gap-1">
                                  Hybrid
                                  <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">Recommended</Badge>
                                </p>
                                <p className="text-[11px] text-muted-foreground">Dynamic + pinned + excluded</p>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FieldGroup>

                  <FieldGroup label="Status">
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="disabled">Disabled</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldGroup label="Position" desc="Lower = shown first on homepage">
                    <Input
                      type="number" min={0} max={9999}
                      {...register('position', { valueAsNumber: true })}
                    />
                  </FieldGroup>
                  <FieldGroup label="Section Sub-label" desc="Small text above title (optional)">
                    <Input {...register('section_label')} placeholder="e.g. My Library" />
                  </FieldGroup>
                </div>

                <FieldGroup label="View All Link" desc="Path for the 'View All' button (optional)">
                  <Input {...register('view_all_link')} placeholder="/discover?category=trending" />
                </FieldGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Content type ──────────────────────────────────────────────── */}
          <TabsContent value="content" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />Content Type
                </CardTitle>
                <CardDescription>What types of content this section shows.</CardDescription>
              </CardHeader>
              <CardContent>
                <Controller
                  control={control}
                  name="content_type"
                  render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {([
                        { value: 'all',   label: 'Movies + TV Shows', desc: 'Show both types together', icon: '🎬' },
                        { value: 'movie', label: 'Movies Only',       desc: 'Only movies',              icon: '🎥' },
                        { value: 'tv',    label: 'TV Shows Only',     desc: 'Only TV series',           icon: '📺' },
                      ] as const).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={cn(
                            'p-4 rounded-lg border text-left transition-all',
                            field.value === opt.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/40 hover:bg-muted/30',
                          )}
                        >
                          <div className="text-2xl mb-2">{opt.icon}</div>
                          <p className="font-medium text-sm">{opt.label}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                        </button>
                      ))}
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Filters ───────────────────────────────────────────────────── */}
          <TabsContent value="filters" className="mt-0">
            <div className="space-y-4">
              {watchSectionType === 'manual' && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-amber-500">
                      Filters are ignored for Manual sections. Switch to Dynamic or Hybrid to use filters.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Filter logic */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Filter Logic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {(['AND', 'OR'] as const).map(l => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => updateFilter('logic', l)}
                        className={cn(
                          'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                          (filters.logic ?? 'AND') === l
                            ? 'bg-primary/15 border-primary/40 text-primary'
                            : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted',
                        )}
                      >
                        {l}
                      </button>
                    ))}
                    <p className="text-xs text-muted-foreground self-center">
                      {(filters.logic ?? 'AND') === 'AND' ? 'All conditions must match' : 'Any condition may match'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Genres */}
              <Card>
                <CardHeader><CardTitle className="text-base">Genre</CardTitle></CardHeader>
                <CardContent>
                  <GenrePicker
                    contentType={watchContentType}
                    included={genreInclude}
                    excluded={genreExclude}
                    onInclude={handleGenreInclude}
                    onExclude={handleGenreExclude}
                    onRemove={handleGenreRemove}
                  />
                </CardContent>
              </Card>

              {/* Language */}
              <Card>
                <CardHeader><CardTitle className="text-base">Original Language</CardTitle></CardHeader>
                <CardContent>
                  <ListPicker<string>
                    all={LANGUAGES}
                    included={langInclude}
                    excluded={langExclude}
                    onInclude={v => setFilters(prev => ({ ...prev, languages: { include: [...(prev.languages?.include ?? []), v], exclude: prev.languages?.exclude ?? [] } }))}
                    onExclude={v => setFilters(prev => ({ ...prev, languages: { include: prev.languages?.include ?? [], exclude: [...(prev.languages?.exclude ?? []), v] } }))}
                    onRemove={v => setFilters(prev => ({ ...prev, languages: { include: (prev.languages?.include ?? []).filter(x => x !== v), exclude: (prev.languages?.exclude ?? []).filter(x => x !== v) } }))}
                  />
                </CardContent>
              </Card>

              {/* Country */}
              <Card>
                <CardHeader><CardTitle className="text-base">Origin Country</CardTitle></CardHeader>
                <CardContent>
                  <ListPicker<string>
                    all={COUNTRIES}
                    included={countryInclude}
                    excluded={countryExclude}
                    onInclude={v => setFilters(prev => ({ ...prev, countries: { include: [...(prev.countries?.include ?? []), v], exclude: prev.countries?.exclude ?? [] } }))}
                    onExclude={v => setFilters(prev => ({ ...prev, countries: { include: prev.countries?.include ?? [], exclude: [...(prev.countries?.exclude ?? []), v] } }))}
                    onRemove={v => setFilters(prev => ({ ...prev, countries: { include: (prev.countries?.include ?? []).filter(x => x !== v), exclude: (prev.countries?.exclude ?? []).filter(x => x !== v) } }))}
                  />
                </CardContent>
              </Card>

              {/* Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Keywords</CardTitle>
                  <CardDescription>TMDB keywords to match. Click a result to include.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3">
                    {(['ANY', 'ALL'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => updateFilter('keywords', {
                          include: filters.keywords?.include ?? [],
                          exclude: filters.keywords?.exclude ?? [],
                          match: m,
                        })}
                        className={cn(
                          'px-3 py-1.5 rounded border text-xs font-medium transition-colors',
                          (filters.keywords?.match ?? 'ANY') === m
                            ? 'bg-primary/15 border-primary/40 text-primary'
                            : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted',
                        )}
                      >
                        Match {m}
                      </button>
                    ))}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Include keywords</Label>
                    <KeywordSearch
                      added={new Set(filters.keywords?.include ?? [])}
                      onAdd={(kwId, kwName) => {
                        setKwIncludeNames(prev => new Map(prev).set(kwId, kwName));
                        updateFilter('keywords', {
                          include: [...(filters.keywords?.include ?? []), kwId],
                          exclude: filters.keywords?.exclude ?? [],
                          match: filters.keywords?.match ?? 'ANY',
                        });
                      }}
                    />
                    <TokenList
                      items={(filters.keywords?.include ?? []).map(id => ({ id, name: kwIncludeNames.get(id) ?? String(id) }))}
                      onRemove={id => setFilters(prev => ({
                        ...prev,
                        keywords: {
                          include: (prev.keywords?.include ?? []).filter(x => x !== id),
                          exclude: prev.keywords?.exclude ?? [],
                          match: prev.keywords?.match ?? 'ANY',
                        },
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Rating */}
              <Card>
                <CardHeader><CardTitle className="text-base">Rating</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FieldGroup label="Minimum rating">
                      <Input
                        type="number" min={0} max={10} step={0.1}
                        placeholder="e.g. 7.0"
                        value={filters.rating?.min ?? ''}
                        onChange={e => updateFilter('rating', {
                          min: e.target.value ? parseFloat(e.target.value) : null,
                          max: filters.rating?.max ?? null,
                        })}
                      />
                    </FieldGroup>
                    <FieldGroup label="Maximum rating">
                      <Input
                        type="number" min={0} max={10} step={0.1}
                        placeholder="e.g. 10.0"
                        value={filters.rating?.max ?? ''}
                        onChange={e => updateFilter('rating', {
                          min: filters.rating?.min ?? null,
                          max: e.target.value ? parseFloat(e.target.value) : null,
                        })}
                      />
                    </FieldGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Vote count */}
              <Card>
                <CardHeader><CardTitle className="text-base">Vote Count</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <FieldGroup label="Minimum votes">
                      <Input
                        type="number" min={0}
                        placeholder="e.g. 200"
                        value={filters.vote_count?.min ?? ''}
                        onChange={e => updateFilter('vote_count', {
                          min: e.target.value ? parseInt(e.target.value) : null,
                          max: filters.vote_count?.max ?? null,
                        })}
                      />
                    </FieldGroup>
                    <FieldGroup label="Maximum votes">
                      <Input
                        type="number" min={0}
                        placeholder="e.g. 50000"
                        value={filters.vote_count?.max ?? ''}
                        onChange={e => updateFilter('vote_count', {
                          min: filters.vote_count?.min ?? null,
                          max: e.target.value ? parseInt(e.target.value) : null,
                        })}
                      />
                    </FieldGroup>
                  </div>
                </CardContent>
              </Card>

              {/* Release date */}
              <Card>
                <CardHeader><CardTitle className="text-base">Release Date</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {DATE_PRESETS.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => updateFilter('release_date', {
                          preset: p.value as NonNullable<SectionFilters['release_date']>['preset'],
                          from: null, to: null, last_x: null,
                        })}
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs border transition-colors',
                          filters.release_date?.preset === p.value
                            ? 'bg-primary/15 border-primary/40 text-primary'
                            : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted',
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => updateFilter('release_date', undefined)}
                      className="px-2.5 py-1 rounded-full text-xs border border-border text-muted-foreground hover:bg-muted"
                    >
                      Clear
                    </button>
                  </div>
                  {filters.release_date?.preset === 'last_x_days' && (
                    <FieldGroup label="Days">
                      <Input
                        type="number" min={1}
                        placeholder="e.g. 14"
                        value={filters.release_date?.last_x ?? ''}
                        onChange={e => updateFilter('release_date', {
                          ...filters.release_date,
                          last_x: e.target.value ? parseInt(e.target.value) : null,
                        })}
                        className="w-32"
                      />
                    </FieldGroup>
                  )}
                  {filters.release_date?.preset === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                      <FieldGroup label="From">
                        <Input
                          type="date"
                          value={filters.release_date?.from ?? ''}
                          onChange={e => updateFilter('release_date', {
                            ...filters.release_date,
                            from: e.target.value || null,
                          })}
                        />
                      </FieldGroup>
                      <FieldGroup label="To">
                        <Input
                          type="date"
                          value={filters.release_date?.to ?? ''}
                          onChange={e => updateFilter('release_date', {
                            ...filters.release_date,
                            to: e.target.value || null,
                          })}
                        />
                      </FieldGroup>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Runtime */}
              <Card>
                <CardHeader><CardTitle className="text-base">Runtime (minutes)</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <FieldGroup label="Minimum">
                      <Input
                        type="number" min={0}
                        placeholder="e.g. 90"
                        value={filters.runtime?.min ?? ''}
                        onChange={e => updateFilter('runtime', {
                          min: e.target.value ? parseInt(e.target.value) : null,
                          max: filters.runtime?.max ?? null,
                        })}
                      />
                    </FieldGroup>
                    <FieldGroup label="Maximum">
                      <Input
                        type="number" min={0}
                        placeholder="e.g. 180"
                        value={filters.runtime?.max ?? ''}
                        onChange={e => updateFilter('runtime', {
                          min: filters.runtime?.min ?? null,
                          max: e.target.value ? parseInt(e.target.value) : null,
                        })}
                      />
                    </FieldGroup>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Sorting ───────────────────────────────────────────────────── */}
          <TabsContent value="sorting" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-primary" />Sorting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <FieldGroup label="Sort By">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setValue('sort_by', opt.value)}
                        className={cn(
                          'px-3 py-2.5 rounded-lg border text-sm text-left transition-colors',
                          watchSortBy === opt.value
                            ? 'bg-primary/10 border-primary/40 text-primary font-medium'
                            : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup label="Direction">
                  <Controller
                    control={control}
                    name="sort_direction"
                    render={({ field }) => (
                      <div className="flex gap-3">
                        {(['asc', 'desc'] as const).map(d => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => field.onChange(d)}
                            className={cn(
                              'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                              field.value === d
                                ? 'bg-primary/15 border-primary/40 text-primary'
                                : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted',
                            )}
                          >
                            {d === 'asc' ? '↑ Ascending' : '↓ Descending'}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </FieldGroup>

                {(watchSortBy === 'top_rated' || watchSortBy === 'highest_vote_count') && (
                  <FieldGroup
                    label="Minimum Vote Count for Ranking"
                    desc="Prevents titles with very few votes from dominating top-rated lists."
                  >
                    <Input
                      type="number" min={0}
                      placeholder="e.g. 500"
                      value={watch('min_vote_count') ?? ''}
                      onChange={e => setValue('min_vote_count', e.target.value ? parseInt(e.target.value) : null)}
                    />
                  </FieldGroup>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Manual / Hybrid ───────────────────────────────────────────── */}
          <TabsContent value="manual" className="mt-0">
            <div className="space-y-4">
              {watchSectionType === 'dynamic' && (
                <Card className="border-amber-500/30 bg-amber-500/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-amber-500">
                      This tab is for Manual and Hybrid sections. Switch your section type to use pinned/excluded items.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Pinned items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {watchSectionType === 'manual' ? 'Section Items' : 'Pinned Items'}
                  </CardTitle>
                  <CardDescription>
                    {watchSectionType === 'manual'
                      ? 'These titles make up the full section content, in this order.'
                      : 'These appear first, before dynamic results.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <TitleSearch
                    excludeIds={new Set(pinnedItems.map(p => `${p.media_type}:${p.tmdb_id}`))}
                    onAdd={item => setPinnedItems(prev => [...prev, item])}
                  />
                  {pinnedItems.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handlePinnedDragEnd}
                    >
                      <SortableContext
                        items={pinnedItems.map(p => `${p.media_type}:${p.tmdb_id}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-1.5">
                          {pinnedItems.map((item, idx) => (
                            <SortablePinnedItem
                              key={`${item.media_type}:${item.tmdb_id}`}
                              item={item}
                              onRemove={() => setPinnedItems(prev => prev.filter((_, i) => i !== idx))}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No items added yet. Search above to add.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Excluded items — for Hybrid */}
              {watchSectionType === 'hybrid' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Excluded Items</CardTitle>
                    <CardDescription>These titles will never appear in this section.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <TitleSearch
                      excludeIds={new Set(excludedItems.map(p => `${p.media_type}:${p.tmdb_id}`))}
                      onAdd={item => setExcludedItems(prev => [...prev, item])}
                    />
                    {excludedItems.length > 0 && (
                      <div className="space-y-1.5">
                        {excludedItems.map((item, idx) => (
                          <div key={`${item.media_type}:${item.tmdb_id}`}
                            className="flex items-center gap-2.5 p-2 rounded-lg border bg-destructive/5">
                            {item.poster_path && (
                              <img
                                src={tmdbImageUrl(item.poster_path, 'w92') ?? ''}
                                alt={item.title}
                                className="w-8 h-12 object-cover rounded shrink-0"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.title}</p>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 mt-0.5">
                                {item.media_type === 'movie' ? 'Movie' : 'TV'}
                              </Badge>
                            </div>
                            <Button
                              type="button" variant="ghost" size="icon"
                              className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                              onClick={() => setExcludedItems(prev => prev.filter((_, i) => i !== idx))}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ── Display ───────────────────────────────────────────────────── */}
          <TabsContent value="display" className="mt-0">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layout className="w-4 h-4 text-primary" />Layout
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Controller
                    control={control}
                    name="layout"
                    render={({ field }) => (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {LAYOUT_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => field.onChange(opt.value)}
                            className={cn(
                              'p-3 rounded-lg border text-left transition-all',
                              field.value === opt.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/30 hover:bg-muted/30',
                            )}
                          >
                            <p className="text-sm font-medium">{opt.label}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Item Limit</CardTitle>
                  <CardDescription>Max number of items to show.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Controller
                    control={control}
                    name="item_limit"
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-2">
                        {ITEM_LIMIT_OPTIONS.map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => field.onChange(n)}
                            className={cn(
                              'w-14 h-10 rounded-lg border text-sm font-medium transition-colors',
                              field.value === n
                                ? 'bg-primary/15 border-primary/40 text-primary'
                                : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted',
                            )}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Card Information</CardTitle>
                  <CardDescription>What metadata to show on each card.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(Object.keys(DEFAULT_DISPLAY_OPTIONS) as (keyof DisplayOptions)[]).map(key => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="text-sm capitalize cursor-pointer" htmlFor={`disp_${key}`}>
                          {key.replace('show_', '').replace(/_/g, ' ')}
                        </Label>
                        <Switch
                          id={`disp_${key}`}
                          checked={displayOpts[key]}
                          onCheckedChange={v => setDisplayOpts(prev => ({ ...prev, [key]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Schedule ──────────────────────────────────────────────────── */}
          <TabsContent value="schedule" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />Schedule
                </CardTitle>
                <CardDescription>
                  Set when this section is active. Leave blank to use Status directly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FieldGroup label="Start date/time" desc="Section becomes visible at this time (UTC)">
                    <Input type="datetime-local" {...register('start_at')} />
                  </FieldGroup>
                  <FieldGroup label="End date/time" desc="Section automatically expires (leave blank = no end)">
                    <Input type="datetime-local" {...register('end_at')} />
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setValue('status',   'published');
                      setValue('start_at', null);
                      setValue('end_at',   null);
                    }}
                    className="p-3 rounded-lg border border-border hover:border-primary/40 text-left transition-colors"
                  >
                    <p className="text-sm font-medium">Start Immediately</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Published now, no end date</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('status',   'scheduled');
                    }}
                    className="p-3 rounded-lg border border-border hover:border-primary/40 text-left transition-colors"
                  >
                    <p className="text-sm font-medium">Use Schedule</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Active between start/end dates</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('status',   'draft');
                      setValue('start_at', null);
                      setValue('end_at',   null);
                    }}
                    className="p-3 rounded-lg border border-border hover:border-primary/40 text-left transition-colors"
                  >
                    <p className="text-sm font-medium">Keep as Draft</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Not shown until published</p>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border">
                  <p className="text-xs text-muted-foreground">
                    Current status: <span className="font-medium text-foreground">{watchStatus}</span>
                    {watch('start_at') && ` · Starts ${new Date(watch('start_at')!).toLocaleString()}`}
                    {watch('end_at')   && ` · Ends ${new Date(watch('end_at')!).toLocaleString()}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Preview ───────────────────────────────────────────────────── */}
          <TabsContent value="preview" className="mt-0">
            <SectionPreviewPanel section={previewSection} />
          </TabsContent>

          {/* ── Publish ───────────────────────────────────────────────────── */}
          <TabsContent value="publish" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-primary" />Publish Section
                </CardTitle>
                <CardDescription>Review and publish this section to the homepage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium truncate">{watch('name') || '—'}</span>
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">{watch('section_type')}</span>
                    <span className="text-muted-foreground">Content</span>
                    <span className="font-medium capitalize">{watch('content_type')}</span>
                    <span className="text-muted-foreground">Layout</span>
                    <span className="font-medium">{LAYOUT_OPTIONS.find(l => l.value === watch('layout'))?.label ?? '—'}</span>
                    <span className="text-muted-foreground">Sort By</span>
                    <span className="font-medium">{SORT_OPTIONS.find(s => s.value === watch('sort_by'))?.label ?? '—'}</span>
                    <span className="text-muted-foreground">Limit</span>
                    <span className="font-medium">{watch('item_limit')} items</span>
                    <span className="text-muted-foreground">Position</span>
                    <span className="font-medium">{watch('position')}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={saving}
                    onClick={handleSubmit(v => save(v, 'draft'))}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    disabled={saving}
                    onClick={handleSubmit(v => save(v, 'published'))}
                  >
                    {saving
                      ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      : <Rocket className="w-4 h-4 mr-2" />
                    }
                    Publish to Homepage
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom nav */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={tabIdx === 0}
            onClick={() => setActiveTab(TABS[tabIdx - 1].id)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {tabIdx + 1} / {TABS.length}
          </span>
          {tabIdx < TABS.length - 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTab(TABS[tabIdx + 1].id)}
            >
              Next<ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={saving}
              onClick={handleSubmit(v => save(v, 'published'))}
            >
              {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Rocket className="w-4 h-4 mr-1.5" />}
              Publish
            </Button>
          )}
        </div>
      </form>
    </AdminLayout>
  );
}
