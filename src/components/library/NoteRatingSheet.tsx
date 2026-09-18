import { useState, useEffect } from 'react';
import { Star, NotebookPen, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { updateLibraryNoteRating } from '@/lib/supabase/library';
import type { LibraryItem } from '@/lib/supabase/library';

// ── Star rating widget ────────────────────────────────────────────────────────
function StarRating({
  value, onChange,
}: { value: number | null; onChange: (v: number | null) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);

  // 10 half-stars rendered as 5 full stars, each split into two click zones
  const display = hovered ?? value ?? 0;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => {
        const full  = star * 2;
        const half  = star * 2 - 1;
        const filled = display >= full ? 'full' : display >= half ? 'half' : 'empty';
        return (
          <div key={star} className="relative w-7 h-7 cursor-pointer"
            onMouseLeave={() => setHovered(null)}>
            {/* left half → half-star */}
            <div className="absolute inset-y-0 left-0 w-1/2 z-10"
              onMouseEnter={() => setHovered(half)}
              onClick={() => onChange(value === half ? null : half)} />
            {/* right half → full star */}
            <div className="absolute inset-y-0 right-0 w-1/2 z-10"
              onMouseEnter={() => setHovered(full)}
              onClick={() => onChange(value === full ? null : full)} />
            {/* visual */}
            <svg viewBox="0 0 24 24" className="w-7 h-7">
              <defs>
                <linearGradient id={`sg-${star}`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="50%"
                    stopColor={filled === 'empty' ? 'transparent' : '#f59e0b'}
                    stopOpacity={filled === 'empty' ? 0 : 1} />
                  <stop offset="50%"
                    stopColor={filled === 'full' ? '#f59e0b' : 'transparent'}
                    stopOpacity={filled === 'full' ? 1 : 0} />
                </linearGradient>
              </defs>
              <Star
                className="w-7 h-7"
                stroke={filled === 'empty' ? 'rgba(255,255,255,0.25)' : '#f59e0b'}
                fill={`url(#sg-${star})`}
                strokeWidth={1.5}
              />
            </svg>
          </div>
        );
      })}
      {value !== null && (
        <span className="ml-2 text-sm font-semibold text-amber-400">
          {(value / 2).toFixed(1)}<span className="text-white/30 font-normal">/5</span>
        </span>
      )}
    </div>
  );
}

// ── Sheet panel ───────────────────────────────────────────────────────────────
interface NoteRatingSheetProps {
  item: LibraryItem;
  open: boolean;
  onClose: () => void;
  onSaved: (note: string | null, rating: number | null) => void;
}

export default function NoteRatingSheet({ item, open, onClose, onSaved }: NoteRatingSheetProps) {
  const [note,   setNote]   = useState<string>(item.note ?? '');
  const [rating, setRating] = useState<number | null>(item.user_rating ?? null);
  const [saving, setSaving] = useState(false);

  // Sync if item changes (e.g. navigating between detail pages)
  useEffect(() => {
    setNote(item.note ?? '');
    setRating(item.user_rating ?? null);
  }, [item.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const trimmed = note.trim() || null;
      await updateLibraryNoteRating(item.id, trimmed, rating);
      onSaved(trimmed, rating);
      toast.success('Note & rating saved');
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip} />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl px-5 pt-5 pb-8 md:left-1/2 md:-translate-x-1/2 md:w-[480px] md:bottom-8 md:rounded-2xl"
        style={{
          background: 'rgba(10,22,26,0.97)',
          border: '1px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 -8px 48px rgba(0,0,0,0.6)',
        }}>

        {/* Drag handle (mobile) */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4 md:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.25)' }}>
              <NotebookPen className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Add to your log</p>
              <p className="text-[11px] text-white/40 truncate max-w-[240px] mt-0.5">{item.title}</p>
            </div>
          </div>
          <button onClick={handleSkip}
            className="p-1.5 rounded-lg hover:bg-white/8 transition-colors shrink-0">
            <X className="w-4 h-4 text-white/40" />
          </button>
        </div>

        {/* Rating */}
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-widest text-white/35 mb-2.5">Your Rating</p>
          <StarRating value={rating} onChange={setRating} />
          {rating === null && (
            <p className="text-[11px] text-white/25 mt-1.5">Click a star to rate — click again to clear</p>
          )}
        </div>

        {/* Note textarea */}
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-widest text-white/35 mb-2">Note</p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What did you think? Any scenes that stood out?"
            maxLength={1000}
            rows={4}
            className="w-full resize-none rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.45)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
          />
          <p className="text-[10px] text-white/20 text-right mt-1">{note.length}/1000</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5">
          <button onClick={handleSkip}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white/75 transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Skip
          </button>
          <button onClick={() => void handleSave()} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, hsl(189,70%,30%), hsl(189,80%,20%))' }}>
            {saving
              ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <Check className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>
    </>
  );
}
