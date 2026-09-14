interface GaugeProps {
  value: number;
  color?: string;
  showLabels?: boolean;
  min?: string;
  max?: string;
}

const TICKS = 40;

export default function Gauge({ value, color = '#0ea5e9', showLabels, min, max }: GaugeProps) {
  const active = Math.round((value / 100) * TICKS);
  const cx = 100;
  const cy = 100;
  const rOuter = 80;
  const rInner = rOuter - 10;

  const ticks = Array.from({ length: TICKS }, (_, i) => {
    // 180° arc: start at angle π, sweep to 2π
    const angle = Math.PI + (i / (TICKS - 1)) * Math.PI;
    const x1 = cx + rInner * Math.cos(angle);
    const y1 = cy + rInner * Math.sin(angle);
    const x2 = cx + rOuter * Math.cos(angle);
    const y2 = cy + rOuter * Math.sin(angle);
    return { x1, y1, x2, y2, isActive: i < active };
  });

  return (
    <div className="mx-auto w-full" style={{ maxWidth: 260 }}>
      <svg viewBox="0 0 200 120" className="w-full">
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.isActive ? color : '#d4d4d8'}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ))}
        <text
          x={100}
          y={105}
          textAnchor="middle"
          fontSize={22}
          fontWeight={600}
          fill="#111"
        >
          {value}%
        </text>
      </svg>
      {showLabels && (
        <div className="flex justify-between text-neutral-500" style={{ fontSize: 11 }}>
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
