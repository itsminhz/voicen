import { cn } from '@/client/lib/utils';
import { STUDY_MODES, MODE_META, type StudyMode } from './modes';

interface ModeSelectorProps {
  value: StudyMode;
  onChange: (mode: StudyMode) => void;
  compact?: boolean;
}

export default function ModeSelector({ value, onChange, compact = false }: ModeSelectorProps) {
  return (
    <div
      className={cn(
        'grid gap-3',
        compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      )}
    >
      {STUDY_MODES.map((mode) => {
        const meta = MODE_META[mode];
        const Icon = meta.icon;
        const selected = value === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              'group flex items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200',
              selected
                ? 'border-accent bg-accent-soft shadow-sm'
                : 'border-line-soft bg-surface hover:border-accent/40 hover:bg-paper-dim'
            )}
          >
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                selected ? 'bg-accent text-accent-contrast' : 'bg-paper-dim text-ink-soft group-hover:text-accent-dark'
              )}
            >
              <Icon className="h-4.5 w-4.5" strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className={cn('block text-sm font-semibold', selected ? 'text-accent-dark' : 'text-ink')}>
                {meta.label}
              </span>
              {!compact && (
                <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{meta.description}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
