import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';

export interface TourStep {
  /** CSS selector of the element to spotlight (uses [data-tour="..."]). */
  target: string;
  title: string;
  description: string;
}

const PADDING = 8;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Lightweight spotlight tour. Highlights one element at a time with a dimmed
 * overlay and a tooltip card. Fully skippable at any point.
 */
export default function DemoTour({
  steps,
  onClose,
}: {
  steps: TourStep[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const step = steps[index];

  const measure = useCallback(() => {
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({
      top: r.top - PADDING,
      left: r.left - PADDING,
      width: r.width + PADDING * 2,
      height: r.height + PADDING * 2,
    });
  }, [step.target]);

  useLayoutEffect(() => {
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
    }
    measure();
  }, [step.target, measure]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && index < steps.length - 1) setIndex(index + 1);
      if (e.key === 'ArrowLeft' && index > 0) setIndex(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, steps.length, onClose]);

  if (!rect) return null;

  const isLast = index === steps.length - 1;

  // Tooltip position: below the spotlight if there's room, otherwise above.
  const viewportH = window.innerHeight;
  const tooltipBelow = rect.top + rect.height + 190 < viewportH;
  const tooltipTop = tooltipBelow ? rect.top + rect.height + 12 : undefined;
  const tooltipBottom = tooltipBelow ? undefined : viewportH - rect.top + 12;
  const tooltipLeft = Math.max(16, Math.min(rect.left, window.innerWidth - 336));

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-label="Product tour">
      {/* Spotlight: transparent hole + giant shadow dims the rest */}
      <div
        className="absolute rounded-2xl transition-all duration-300 ease-out"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          boxShadow: '0 0 0 9999px rgba(23, 23, 23, 0.55)',
          border: '2px solid #0ea5e9',
        }}
      />
      {/* Click-catcher so clicks outside don't hit the page */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Tooltip card */}
      <div
        className="absolute w-80 max-w-[calc(100vw-32px)] animate-slide-up-sm rounded-2xl border border-line bg-surface p-4 shadow-xl"
        style={{ top: tooltipTop, bottom: tooltipBottom, left: tooltipLeft }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium" style={{ color: '#0ea5e9' }}>
            Step {index + 1} of {steps.length}
          </p>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-ink-faint transition-colors hover:bg-paper-dim hover:text-ink"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="mt-1 text-sm font-semibold text-ink">{step.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">{step.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-medium text-ink-faint transition-colors hover:text-ink"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                onClick={() => setIndex(index - 1)}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-paper-dim"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
            )}
            <button
              onClick={() => (isLast ? onClose() : setIndex(index + 1))}
              className="inline-flex items-center gap-1 rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-dark"
            >
              {isLast ? (
                <>
                  Done <Check className="h-3 w-3" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
