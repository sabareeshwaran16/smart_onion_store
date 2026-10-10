import { Wind, Fan, Zap } from 'lucide-react';
import { StatusBadge } from './ui';

export default function AutomationPanel({ sensors }) {
  const fan = sensors?.fanStatus || 'ON';
  const relay = sensors?.relayStatus || 'AUTO';

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 16 }}>Automation Panel</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Fan */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: fan === 'ON' ? '#f0fdf4' : '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Fan size={17} color={fan === 'ON' ? '#16a34a' : '#9ca3af'} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Cooling Fan</p>
              <p style={{ fontSize: 11, color: '#9ca3af' }}>Auto-activated at 28°C</p>
            </div>
          </div>
          <StatusBadge status={fan} />
        </div>

        {/* Relay */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={17} color="#2563eb" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Relay Module</p>
              <p style={{ fontSize: 11, color: '#9ca3af' }}>Channel 1 — Fan Control</p>
            </div>
          </div>
          <StatusBadge status={relay === 'AUTO' ? 'auto' : 'active'} />
        </div>

        {/* Mode toggle info */}
        <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
          <p style={{ fontSize: 12, color: '#1d4ed8', fontWeight: 500 }}>
            🤖 Auto Mode Active — System controls fan based on temperature & humidity thresholds.
          </p>
        </div>
      </div>
    </div>
  );
}
