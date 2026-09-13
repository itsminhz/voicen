import { Mic, Square } from 'lucide-react';
import { cn } from '@/client/lib/utils';

interface MicButtonProps {
  recording: boolean;
  requesting: boolean;
  onClick: () => void;
  size?: 'lg' | 'md';
}

export default function MicButton({ recording, requesting, onClick, size = 'lg' }: MicButtonProps) {
  const dim = size === 'lg' ? 'w-28 h-28' : 'w-16 h-16';
  const iconSize = size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={requesting}
      aria-label={recording ? 'Stop recording' : 'Start recording'}
      className="relative flex items-center justify-center focus-visible:outline-none disabled:cursor-wait"
    >
      {recording && (
        <>
          <span className="absolute inline-flex rounded-full bg-accent/30 animate-mic-ring" style={{ width: '100%', height: '100%' }} />
          <span
            className="absolute inline-flex rounded-full bg-accent/20 animate-mic-ring"
            style={{ width: '100%', height: '100%', animationDelay: '0.6s' }}
          />
        </>
      )}
      <span
        className={cn(
          dim,
          'relative flex items-center justify-center rounded-full shadow-md transition-all duration-300',
          recording
            ? 'bg-accent text-accent-contrast animate-mic-pulse'
            : 'bg-accent text-accent-contrast hover:bg-accent-dark hover:scale-105'
        )}
      >
        {recording ? <Square className={iconSize} fill="currentColor" /> : <Mic className={iconSize} strokeWidth={2} />}
      </span>
    </button>
  );
}
