// Circular health gauge
export default function HealthGauge({ score, size = 140 }) {
  const r = (size / 2) - 14;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const offset = circ - (pct / 100) * circ;

  const color = pct >= 75 ? '#16a34a' : pct >= 50 ? '#f59e0b' : '#dc2626';
  const status = pct >= 75 ? 'Healthy' : pct >= 50 ? 'Warning' : 'Critical';
  const statusBg = pct >= 75 ? '#f0fdf4' : pct >= 50 ? '#fffbeb' : '#fef2f2';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#f3f4f6" strokeWidth={10} />
          {/* Progress */}
          <circle cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>/ 100</span>
        </div>
      </div>
      <span style={{
        fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 99,
        background: statusBg, color,
      }}>{status}</span>
    </div>
  );
}
