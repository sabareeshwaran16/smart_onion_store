// color → [iconBg, iconColor, valuColor, badgeBg, badgeText]
const theme = {
  blue:   { icon: '#eff6ff', iconC: '#2563eb', val: '#1e40af', badge: '#dbeafe', badgeC: '#1d4ed8' },
  green:  { icon: '#f0fdf4', iconC: '#16a34a', val: '#15803d', badge: '#dcfce7', badgeC: '#15803d' },
  orange: { icon: '#fff7ed', iconC: '#ea580c', val: '#c2410c', badge: '#ffedd5', badgeC: '#c2410c' },
  purple: { icon: '#faf5ff', iconC: '#7c3aed', val: '#6d28d9', badge: '#ede9fe', badgeC: '#6d28d9' },
  teal:   { icon: '#f0fdfa', iconC: '#0d9488', val: '#0f766e', badge: '#ccfbf1', badgeC: '#0f766e' },
  red:    { icon: '#fef2f2', iconC: '#dc2626', val: '#b91c1c', badge: '#fee2e2', badgeC: '#b91c1c' },
  cyan:   { icon: '#ecfeff', iconC: '#0891b2', val: '#0e7490', badge: '#cffafe', badgeC: '#0e7490' },
};

export default function StatCard({ title, value, unit, icon: Icon, color = 'blue', badge, trend }) {
  const t = theme[color] || theme.blue;
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: '20px 22px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: t.icon,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={t.iconC} />
        </div>
        {badge && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
            background: t.badge, color: t.badgeC,
          }}>{badge}</span>
        )}
        {trend !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
            background: trend >= 0 ? '#dcfce7' : '#fee2e2',
            color: trend >= 0 ? '#15803d' : '#b91c1c',
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      {/* Bottom row */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', marginBottom: 4 }}>{title}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</span>
          {unit && <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>{unit}</span>}
        </div>
      </div>
    </div>
  );
}
