// Reusable UI primitives

// StatusBadge
export function StatusBadge({ status, size = 'sm' }) {
  const map = {
    online: { bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a', label: 'Online' },
    offline: { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626', label: 'Offline' },
    connected: { bg: '#eff6ff', color: '#2563eb', dot: '#2563eb', label: 'Connected' },
    active: { bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a', label: 'Active' },
    ON: { bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a', label: 'ON' },
    OFF: { bg: '#f9fafb', color: '#6b7280', dot: '#9ca3af', label: 'OFF' },
    resolved: { bg: '#f0fdf4', color: '#16a34a', dot: '#16a34a', label: 'Resolved' },
    active_alert: { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626', label: 'Active' },
    warning: { bg: '#fffbeb', color: '#d97706', dot: '#f59e0b', label: 'Warning' },
    critical: { bg: '#fef2f2', color: '#dc2626', dot: '#dc2626', label: 'Critical' },
    info: { bg: '#eff6ff', color: '#2563eb', dot: '#3b82f6', label: 'Info' },
    auto: { bg: '#eff6ff', color: '#2563eb', dot: '#2563eb', label: 'Auto' },
  };
  const t = map[status] || map.info;
  const fs = size === 'sm' ? 11 : 12;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: size === 'sm' ? '2px 8px' : '4px 10px',
      borderRadius: 99, fontSize: fs, fontWeight: 600,
      background: t.bg, color: t.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot, flexShrink: 0 }} />
      {t.label}
    </span>
  );
}

// EmptyState
export function EmptyState({ icon = '📭', title = 'No data', message = 'Nothing to show here yet.' }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: '#9ca3af' }}>{message}</p>
    </div>
  );
}

// ErrorState
export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#dc2626', marginBottom: 6 }}>Error</p>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{
          padding: '8px 20px', borderRadius: 8, border: 'none',
          background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Retry</button>
      )}
    </div>
  );
}

// Skeleton loader
export function Skeleton({ width = '100%', height = 16, radius = 6, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
      ...style,
    }} />
  );
}

// SkeletonCard
export function SkeletonCard() {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Skeleton width={40} height={40} radius={10} />
        <Skeleton width={60} height={22} radius={99} />
      </div>
      <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height={28} radius={6} />
    </div>
  );
}

// SectionTitle
export function SectionTitle({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {children}
      </p>
      {action}
    </div>
  );
}

// Card wrapper
export function Card({ children, style = {}, padding = '20px 22px' }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb',
      borderRadius: 12, padding, ...style,
    }}>
      {children}
    </div>
  );
}

// PageHeader
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
