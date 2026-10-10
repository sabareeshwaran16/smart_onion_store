const C = {
  red:    { bar: '#ef4444', bg: '#fef2f2', text: '#dc2626', track: '#fee2e2' },
  orange: { bar: '#f97316', bg: '#fff7ed', text: '#ea580c', track: '#ffedd5' },
  yellow: { bar: '#eab308', bg: '#fefce8', text: '#ca8a04', track: '#fef9c3' },
  green:  { bar: '#16a34a', bg: '#f0fdf4', text: '#15803d', track: '#dcfce7' },
};

export default function RiskGauge({ label, value, color = 'orange' }) {
  const c = C[color] || C.orange;
  const level = value < 20 ? 'Low' : value < 50 ? 'Medium' : 'High';

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12,
      padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af' }}>{label}</p>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
          background: c.bg, color: c.text,
        }}>{level}</span>
      </div>

      {/* Value */}
      <p style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1 }}>
        {value}<span style={{ fontSize: 14, color: '#9ca3af', fontWeight: 400, marginLeft: 2 }}>%</span>
      </p>

      {/* Bar */}
      <div style={{ height: 6, borderRadius: 99, background: c.track, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${value}%`, borderRadius: 99,
          background: c.bar, transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}
