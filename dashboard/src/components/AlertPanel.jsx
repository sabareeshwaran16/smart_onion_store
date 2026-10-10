import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

const cfg = {
  warning: { Icon: AlertTriangle, color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  info:    { Icon: Info,          color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  success: { Icon: CheckCircle,   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
};

export default function AlertPanel({ alerts }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Active Alerts</p>
        {alerts?.length > 0 && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
            background: '#fee2e2', color: '#dc2626',
          }}>{alerts.length} new</span>
        )}
      </div>

      {!alerts?.length ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <CheckCircle size={28} color="#16a34a" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: 13, color: '#9ca3af' }}>No active alerts</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.map(a => {
            const { Icon, color, bg, border } = cfg[a.type] || cfg.info;
            return (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 12px', borderRadius: 8,
                background: bg, border: `1px solid ${border}`,
              }}>
                <Icon size={15} color={color} style={{ marginTop: 1, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{a.message}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{a.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
