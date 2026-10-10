import { Wind, Droplets, Search, CheckCircle, AlertTriangle } from 'lucide-react';

const priorityStyle = {
  High:     { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  Medium:   { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Low:      { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Info:     { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
};

const iconMap = {
  wind: Wind, droplets: Droplets, search: Search,
  check: CheckCircle, alert: AlertTriangle,
};

export default function RecommendationPanel({ recommendations }) {
  if (!recommendations?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>AI Recommendations</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {recommendations.map((r) => {
          const s = priorityStyle[r.priority] || priorityStyle.Info;
          const Icon = iconMap[r.icon] || CheckCircle;
          return (
            <div key={r.id} style={{
              display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10,
              background: s.bg, border: `1px solid ${s.border}`,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: '#fff', border: `1px solid ${s.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={15} color={s.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.title}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: '#fff', color: s.color, border: `1px solid ${s.border}` }}>
                    {r.priority}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{r.reason}</p>
                <p style={{ fontSize: 12, fontWeight: 500, color: s.color }}>→ {r.action}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
