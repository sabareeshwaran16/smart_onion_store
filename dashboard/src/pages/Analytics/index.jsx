import TrendChart from '../../components/TrendChart';
import { mockTrends } from '../../utils/mockData';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>{p.name}:</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const summaryCards = [
  { label: 'Avg Temperature', value: '24.1°C', color: '#ea580c', bg: '#fff7ed' },
  { label: 'Avg Humidity',    value: '67.4%',  color: '#0891b2', bg: '#ecfeff' },
  { label: 'Avg Gas Level',   value: '318 ppm',color: '#7c3aed', bg: '#faf5ff' },
  { label: 'Avg Health Score',value: '81.2',   color: '#16a34a', bg: '#f0fdf4' },
];

export default function Analytics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Analytics</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>24-hour storage performance overview</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {summaryCards.map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>{label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Storage Conditions Overview</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={mockTrends} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ea580c" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="hG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0891b2" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0891b2" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="temperature" name="Temp °C"    stroke="#ea580c" fill="url(#tG)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="humidity"    name="Humidity %" stroke="#0891b2" fill="url(#hG)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <TrendChart data={mockTrends} title="Health Score Trend"  lines={[{ key: 'healthScore', label: 'Health Score' }]} />
        <TrendChart data={mockTrends} title="Spoilage Risk Trend" lines={[{ key: 'spoilage',    label: 'Spoilage %' }]} />
      </div>
    </div>
  );
}
