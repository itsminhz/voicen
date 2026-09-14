import { useRef, useState } from 'react';
import { Pin, PinOff, Trash2, Plus, X, Palette } from 'lucide-react';
import { cn } from '@/client/lib/utils';
import { STICKY_COLORS, STICKY_COLOR_CLASSES, type Sticky, type StickyColor, type StickyItem } from './stickyTypes';

interface StickyCardProps {
  sticky: Sticky;
  onUpdate: (stickyId: string, patch: Partial<Pick<Sticky, 'title' | 'color' | 'items' | 'pinned'>>) => void;
  onDelete: (stickyId: string) => void;
}

export default function StickyCard({ sticky, onUpdate, onDelete }: StickyCardProps) {
  const [showPalette, setShowPalette] = useState(false);
  const [draft, setDraft] = useState('');
  const colors = STICKY_COLOR_CLASSES[sticky.color];
  const doneCount = sticky.items.filter((item) => item.done).length;
  const draftInputRef = useRef<HTMLInputElement>(null);

  function updateItems(items: StickyItem[]) {
    onUpdate(sticky._id, { items });
  }

  function addItem() {
    const text = draft.trim();
    if (!text) return;
    updateItems([...sticky.items, { text, done: false }]);
    setDraft('');
    draftInputRef.current?.focus();
  }

  return (
    <div
      className={cn(
        'group flex flex-col rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md animate-slide-up-sm',
        colors.card
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <input
          value={sticky.title}
          onChange={(e) => onUpdate(sticky._id, { title: e.target.value })}
          className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-ink-faint"
          placeholder="Title"
        />
        <button
          type="button"
          onClick={() => onUpdate(sticky._id, { pinned: !sticky.pinned })}
          aria-label={sticky.pinned ? 'Unpin' : 'Pin'}
          className={cn(
            'shrink-0 rounded-md p-1 transition-all',
            sticky.pinned ? 'text-ink' : 'text-ink-faint opacity-0 hover:text-ink group-hover:opacity-100'
          )}
        >
          {sticky.pinned ? <Pin className="h-4 w-4" fill="currentColor" /> : <Pin className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-2 space-y-1">
        {sticky.items.map((item, i) => (
          <div key={i} className="group/item flex items-start gap-2">
            <button
              type="button"
              onClick={() => updateItems(sticky.items.map((it, idx) => (idx === i ? { ...it, done: !it.done } : it)))}
              aria-label={item.done ? 'Uncheck' : 'Check'}
              className={cn(
                'mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-150',
                item.done ? 'border-ink bg-ink text-white' : 'border-ink/30 bg-white/60 hover:border-ink/60'
              )}
            >
              {item.done && (
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M2.5 6.5L5 9l4.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <input
              value={item.text}
              onChange={(e) =>
                updateItems(sticky.items.map((it, idx) => (idx === i ? { ...it, text: e.target.value } : it)))
              }
              className={cn(
                'w-full bg-transparent text-sm text-ink outline-none',
                item.done && 'text-ink-faint line-through'
              )}
            />
            <button
              type="button"
              onClick={() => updateItems(sticky.items.filter((_, idx) => idx !== i))}
              aria-label="Remove item"
              className="mt-0.5 text-ink-faint opacity-0 transition-opacity hover:text-danger group-hover/item:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-0.5">
          <Plus className="h-4 w-4 shrink-0 text-ink-faint" />
          <input
            ref={draftInputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem();
              }
            }}
            onBlur={addItem}
            placeholder="Add item"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-2">
        <span className="text-xs text-ink-faint">
          {sticky.items.length > 0 ? `${doneCount}/${sticky.items.length}` : 'Empty'}
        </span>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPalette((v) => !v)}
              aria-label="Change color"
              className="rounded-md p-1 text-ink-faint transition-colors hover:text-ink"
            >
              <Palette className="h-4 w-4" />
            </button>
            {showPalette && (
              <div className="absolute bottom-full right-0 z-10 mb-1 flex gap-1 rounded-lg border border-line bg-surface p-1.5 shadow-md animate-fade-in">
                {STICKY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={color}
                    onClick={() => {
                      onUpdate(sticky._id, { color: color as StickyColor });
                      setShowPalette(false);
                    }}
                    className={cn(
                      'h-5 w-5 rounded-full border transition-transform hover:scale-110',
                      STICKY_COLOR_CLASSES[color].swatch,
                      color === sticky.color ? 'border-ink' : 'border-transparent'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onDelete(sticky._id)}
            aria-label="Delete list"
            className="rounded-md p-1 text-ink-faint transition-colors hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
