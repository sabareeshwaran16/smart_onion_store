import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const COLORS = ['#2563eb', '#16a34a', '#ea580c', '#7c3aed', '#0891b2'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
      padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    }}>
      <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>{p.name}:</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function TrendChart({ data, lines, title }) {
  return (
    <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{title}</p>
        <div style={{ display: 'flex', gap: 16 }}>
          {lines.map((l, i) => (
            <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 24, height: 3, borderRadius: 99, background: COLORS[i % COLORS.length] }} />
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false} tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false} tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
          {lines.map((l, i) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.label}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff', fill: COLORS[i % COLORS.length] }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
