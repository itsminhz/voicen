interface WaveformProps {
  levels: number[];
}

export default function Waveform({ levels }: WaveformProps) {
  return (
    <div className="flex h-10 items-center justify-center gap-0.5">
      {levels.map((level, i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-accent/70 transition-all duration-100"
          style={{ height: `${Math.max(8, level * 40)}px` }}
        />
      ))}
    </div>
  );
}
