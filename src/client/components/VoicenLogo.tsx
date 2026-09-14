import { cn } from '@/client/lib/utils';

/** Voicen AI logo — sky-blue voice waveform bars, no background. */
export default function VoicenLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('w-7 h-7', className)} aria-label="Voicen AI logo">
      {[
        { x: 5, h: 10 },
        { x: 10.5, h: 18 },
        { x: 16, h: 26 },
        { x: 21.5, h: 15 },
        { x: 27, h: 8 },
      ].map((bar, i) => (
        <rect
          key={i}
          x={bar.x - 1.6}
          y={16 - bar.h / 2}
          width={3.2}
          height={bar.h}
          rx={1.6}
          fill="#0ea5e9"
        />
      ))}
    </svg>
  );
}
