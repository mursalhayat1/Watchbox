/**
 * Admin Sections Page — list, reorder (DnD), create, edit, duplicate, delete.
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, GripVertical, Pencil, Trash2, Copy, Eye, Power,
  Search, Filter, LayoutList, RefreshCw, ChevronDown,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  adminListSections, adminDeleteSection, adminDuplicateSection,
  adminUpdateSection, adminReorderSections, effectiveStatus,
  type Section, type SectionStatus,
} from '@/lib/supabase/sections';

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<SectionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  published:  { label: 'Published',  variant: 'default',     className: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' },
  draft:      { label: 'Draft',      variant: 'secondary',   className: '' },
  scheduled:  { label: 'Scheduled',  variant: 'outline',     className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  disabled:   { label: 'Disabled',   variant: 'outline',     className: 'bg-muted/50 text-muted-foreground' },
  expired:    { label: 'Expired',    variant: 'destructive', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

function StatusBadge({ status }: { status: SectionStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <Badge variant={cfg.variant} className={`text-[10px] px-1.5 py-0 h-5 font-medium ${cfg.className}`}>
      {cfg.label}
    </Badge>
  );
}

const TYPE_LABELS: Record<string, string> = {
  dynamic: 'Dynamic',
  manual:  'Manual',
  hybrid:  'Hybrid ★',
};

const LAYOUT_LABELS: Record<string, string> = {
  carousel:         'Carousel',
  large_cards:      'Large Cards',
  small_cards:      'Small Cards',
  grid:             'Grid',
  compact_list:     'Compact List',
  featured_carousel:'Featured Carousel',
  hero_cards:       'Hero + Cards',
};

const SORT_LABELS: Record<string, string> = {
  popularity:        'Popular',
  top_rated:         'Top Rated',
  trending_today:    'Trending Today',
  trending_week:     'Trending Week',
  trending_month:    'Trending Month',
  newest_release:    'Newest',
  oldest_release:    'Oldest',
  highest_vote_count:'Most Votes',
  az:                'A-Z',
  za:                'Z-A',
  random:            'Random',
  relevance:         'Relevance',
  recently_added:    'Recently Added',
  recently_updated:  'Recently Updated',
  most_watched:      'Most Watched',
  lowest_vote_count: 'Fewest Votes',
};

// ── Sortable row ──────────────────────────────────────────────────────────────
interface SortableRowProps {
  section: Section;
  onEdit:      (s: Section) => void;
  onDuplicate: (s: Section) => void;
  onToggle:    (s: Section) => void;
  onPreview:   (s: Section) => void;
  onDelete:    (s: Section) => void;
}

function SortableRow({ section, onEdit, onDuplicate, onToggle, onPreview, onDelete }: SortableRowProps) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: section.id });

  const eff = effectiveStatus(section);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-all
        ${isDragging ? 'opacity-60 shadow-xl z-50 scale-[1.01]' : 'hover:bg-muted/40'}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="touch-none text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0 p-1"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Position */}
      <span className="text-[11px] text-muted-foreground w-6 text-center shrink-0 tabular-nums">
        {section.position}
      </span>

      {/* Name + type */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground truncate">{section.name}</p>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 shrink-0">
            {TYPE_LABELS[section.section_type] ?? section.section_type}
          </Badge>
        </div>
        {section.description && (
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{section.description}</p>
        )}
      </div>

      {/* Status */}
      <div className="shrink-0">
        <StatusBadge status={eff} />
      </div>

      {/* Content type */}
      <span className="hidden md:block text-[11px] text-muted-foreground shrink-0 w-12">
        {section.content_type === 'all' ? 'All' : section.content_type === 'movie' ? 'Movies' : 'TV'}
      </span>

      {/* Layout */}
      <span className="hidden lg:block text-[11px] text-muted-foreground shrink-0 w-28 truncate">
        {LAYOUT_LABELS[section.layout] ?? section.layout}
      </span>

      {/* Sort */}
      <span className="hidden xl:block text-[11px] text-muted-foreground shrink-0 w-28 truncate">
        {SORT_LABELS[section.sort_by] ?? section.sort_by}
      </span>

      {/* Limit */}
      <span className="hidden md:block text-[11px] text-muted-foreground shrink-0 w-8 text-center">
        {section.item_limit}
      </span>

      {/* Schedule indicator */}
      {(section.start_at || section.end_at) && (
        <span className="hidden lg:block text-[10px] text-blue-400 shrink-0 truncate max-w-[80px]">
          {section.start_at
            ? new Date(section.start_at).toLocaleDateString()
            : '—'}
        </span>
      )}

      {/* Updated at */}
      <span className="hidden xl:block text-[10px] text-muted-foreground/60 shrink-0 w-20 text-right">
        {new Date(section.updated_at).toLocaleDateString()}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPreview(section)}>
                <Eye className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Preview</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(section)}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onDuplicate(section)}>
              <Copy className="w-3.5 h-3.5 mr-2" />Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggle(section)}>
              <Power className="w-3.5 h-3.5 mr-2" />
              {eff === 'disabled' ? 'Enable' : 'Disable'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(section)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ── Table header ──────────────────────────────────────────────────────────────
function TableHeader() {
  return (
    <div className="flex items-center gap-3 px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
      <div className="w-6 shrink-0" />
      <div className="w-6 shrink-0">Pos</div>
      <div className="flex-1 min-w-0">Name</div>
      <div className="shrink-0 w-20">Status</div>
      <div className="hidden md:block shrink-0 w-12">Type</div>
      <div className="hidden lg:block shrink-0 w-28">Layout</div>
      <div className="hidden xl:block shrink-0 w-28">Sort</div>
      <div className="hidden md:block shrink-0 w-8 text-center">Limit</div>
      <div className="hidden lg:block shrink-0 w-20">Schedule</div>
      <div className="hidden xl:block shrink-0 w-20 text-right">Updated</div>
      <div className="shrink-0 w-24" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminSectionsPage() {
  const navigate = useNavigate();

  const [sections, setSections]   = useState<Section[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilter] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<Section | null>(null);
  const [saving, setSaving]       = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminListSections();
      setSections(data);
    } catch (e) {
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Drag-end: reorder + persist ────────────────────────────────────────────
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = sections.findIndex(s => s.id === active.id);
    const newIdx = sections.findIndex(s => s.id === over.id);
    const reordered = arrayMove(sections, oldIdx, newIdx);

    // Assign new positions (multiples of 10)
    const withPositions = reordered.map((s, i) => ({ ...s, position: (i + 1) * 10 }));
    setSections(withPositions);

    setSaving(true);
    try {
      await adminReorderSections(
        withPositions.map(s => s.id),
        withPositions.map(s => s.position),
      );
    } catch {
      toast.error('Failed to save order');
      load();
    } finally {
      setSaving(false);
    }
  }

  // ── Toggle enable/disable ──────────────────────────────────────────────────
  async function handleToggle(section: Section) {
    const eff = effectiveStatus(section);
    const newStatus = eff === 'disabled' ? 'published' : 'disabled';
    try {
      await adminUpdateSection(section.id, { status: newStatus });
      setSections(prev => prev.map(s => s.id === section.id ? { ...s, status: newStatus } : s));
      toast.success(`Section ${newStatus === 'published' ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update section');
    }
  }

  // ── Duplicate ──────────────────────────────────────────────────────────────
  async function handleDuplicate(section: Section) {
    try {
      const dup = await adminDuplicateSection(section.id);
      setSections(prev => [...prev, dup]);
      toast.success(`"${section.name}" duplicated as draft`);
    } catch {
      toast.error('Failed to duplicate section');
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await adminDeleteSection(deleteTarget.id);
      setSections(prev => prev.filter(s => s.id !== deleteTarget.id));
      toast.success('Section deleted');
    } catch {
      toast.error('Failed to delete section');
    } finally {
      setDeleteTarget(null);
    }
  }

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = sections.filter(s => {
    const eff = effectiveStatus(s);
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === 'all' || eff === filterStatus;
    return matchSearch && matchFilter;
  });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total:     sections.length,
    published: sections.filter(s => effectiveStatus(s) === 'published').length,
    draft:     sections.filter(s => effectiveStatus(s) === 'draft').length,
    disabled:  sections.filter(s => effectiveStatus(s) === 'disabled').length,
  };

  return (
    <AdminLayout
      breadcrumbs={[{ label: 'Sections' }]}
      title="Homepage Sections"
      actions={
        <Button size="sm" onClick={() => navigate('/admin/sections/create')}>
          <Plus className="w-4 h-4 mr-1.5" />New Section
        </Button>
      }
    >
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',     value: stats.total,     color: '' },
          { label: 'Published', value: stats.published,  color: 'text-emerald-500' },
          { label: 'Draft',     value: stats.draft,      color: 'text-muted-foreground' },
          { label: 'Disabled',  value: stats.disabled,   color: 'text-amber-500' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className={`text-2xl font-bold tabular-nums ${color}`}>
                {loading ? <Skeleton className="h-7 w-8 inline-block" /> : value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sections…"
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilter}>
          <SelectTrigger className="w-40 shrink-0">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={load} disabled={loading} className="shrink-0">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Saving indicator */}
      {saving && (
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          <RefreshCw className="w-3 h-3 animate-spin" />Saving order…
        </p>
      )}

      {/* Section list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <LayoutList className="w-4 h-4 text-primary" />
                Sections
              </CardTitle>
              <CardDescription>
                Drag rows to reorder. Order controls the homepage display order.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <LayoutList className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {search || filterStatus !== 'all' ? 'No sections match your filter.' : 'No sections yet.'}
              </p>
              {!search && filterStatus === 'all' && (
                <Button size="sm" onClick={() => navigate('/admin/sections/create')}>
                  <Plus className="w-4 h-4 mr-1.5" />Create first section
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <TableHeader />
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filtered.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filtered.map(section => (
                    <SortableRow
                      key={section.id}
                      section={section}
                      onEdit={s => navigate(`/admin/sections/${s.id}/edit`)}
                      onDuplicate={handleDuplicate}
                      onToggle={handleToggle}
                      onPreview={s => navigate(`/admin/sections/${s.id}/preview`)}
                      onDelete={s => setDeleteTarget(s)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the section from the homepage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
