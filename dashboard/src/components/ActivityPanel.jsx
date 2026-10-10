import { Wind, AlertTriangle, RefreshCw, Cpu } from 'lucide-react';

const iconMap = { fan: Wind, alert: AlertTriangle, sync: RefreshCw, ai: Cpu };

export default function ActivityPanel({ activities }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Recent Activity</p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {activities?.map((a, i) => {
          const Icon = iconMap[a.icon] || RefreshCw;
          const isLast = i === activities.length - 1;
          return (
            <div key={a.id} style={{ display: 'flex', gap: 12 }}>
              {/* Timeline column */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: '#eff6ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={14} color="#2563eb" />
                </div>
                {!isLast && (
                  <div style={{ width: 1, flex: 1, background: '#f3f4f6', margin: '4px 0' }} />
                )}
              </div>
              {/* Text */}
              <div style={{ paddingBottom: isLast ? 0 : 14, paddingTop: 5 }}>
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.4 }}>{a.event}</p>
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{a.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
