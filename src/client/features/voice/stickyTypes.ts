export const STICKY_COLORS = ['yellow', 'green', 'blue', 'pink', 'purple', 'orange', 'gray'] as const;
export type StickyColor = (typeof STICKY_COLORS)[number];

export interface StickyItem {
  text: string;
  done: boolean;
}

export interface Sticky {
  _id: string;
  title: string;
  color: StickyColor;
  items: StickyItem[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Keep-style pastel palettes per color. */
export const STICKY_COLOR_CLASSES: Record<StickyColor, { card: string; swatch: string }> = {
  yellow: { card: 'bg-amber-50 border-amber-200', swatch: 'bg-amber-200' },
  green: { card: 'bg-emerald-50 border-emerald-200', swatch: 'bg-emerald-200' },
  blue: { card: 'bg-sky-50 border-sky-200', swatch: 'bg-sky-200' },
  pink: { card: 'bg-rose-50 border-rose-200', swatch: 'bg-rose-200' },
  purple: { card: 'bg-violet-50 border-violet-200', swatch: 'bg-violet-200' },
  orange: { card: 'bg-orange-50 border-orange-200', swatch: 'bg-orange-200' },
  gray: { card: 'bg-zinc-100 border-zinc-200', swatch: 'bg-zinc-300' },
};
