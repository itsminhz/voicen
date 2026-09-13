import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export type ProcessingPhase = 'transcribing' | 'organizing' | 'saving';

const PHASE_LABELS: Record<ProcessingPhase, string> = {
  transcribing: 'Transcribing your voice...',
  organizing: 'Understanding your notes...',
  saving: 'Building your study material...',
};

const PHASE_ORDER: ProcessingPhase[] = ['transcribing', 'organizing', 'saving'];

interface ProcessingStageProps {
  phase: ProcessingPhase;
}

export default function ProcessingStage({ phase }: ProcessingStageProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const currentIndex = PHASE_ORDER.indexOf(phase);

  return (
    <div className="flex flex-col items-center gap-6 py-10 animate-fade-in">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft">
        <Loader2 className="h-7 w-7 animate-spin text-accent-dark" strokeWidth={2} />
      </div>
      <div className="text-center">
        <p className="font-display text-lg text-ink">
          {PHASE_LABELS[phase]}
          <span className="inline-block w-4 text-left">{dots}</span>
        </p>
        <p className="mt-1 text-sm text-ink-faint">This usually only takes a few seconds</p>
      </div>
      <div className="flex items-center gap-2">
        {PHASE_ORDER.map((step, i) => (
          <span
            key={step}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i <= currentIndex ? 'w-8 bg-accent' : 'w-4 bg-line'
            }`}
          />
        ))}
      </div>
      <div className="w-full max-w-sm space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-3 animate-shimmer rounded-full bg-[linear-gradient(90deg,var(--color-paper-dim)_25%,var(--color-surface)_37%,var(--color-paper-dim)_63%)] bg-[length:400%_100%]"
            style={{ width: i === 2 ? '60%' : '100%' }}
          />
        ))}
      </div>
    </div>
  );
}
