import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { IconButton } from '@/client/components/ui/IconButton';
import type { Flashcard } from './types';

interface FlashcardDeckProps {
  cards: Flashcard[];
}

export default function FlashcardDeck({ cards }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) return null;

  const card = cards[index];

  function go(delta: number) {
    setFlipped(false);
    setIndex((prev) => (prev + delta + cards.length) % cards.length);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-[160px] w-full max-w-md items-center justify-center rounded-2xl border border-line-soft bg-paper-dim p-6 text-center shadow-sm transition-all duration-300 hover:shadow-md"
        style={{ perspective: '1000px' }}
      >
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {flipped ? 'Answer' : 'Question'}
          </p>
          <p className="font-display text-lg text-ink">{flipped ? card.answer : card.question}</p>
        </div>
      </button>
      <div className="flex items-center gap-4">
        <IconButton variant="ghost" size="sm" aria-label="Previous card" onClick={() => go(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </IconButton>
        <span className="text-sm text-ink-soft">
          {index + 1} / {cards.length}
        </span>
        <IconButton variant="ghost" size="sm" aria-label="Flip card" onClick={() => setFlipped((f) => !f)}>
          <RotateCw className="h-4 w-4" />
        </IconButton>
        <IconButton variant="ghost" size="sm" aria-label="Next card" onClick={() => go(1)}>
          <ChevronRight className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
