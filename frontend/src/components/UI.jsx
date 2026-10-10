import React from 'react';

export function LoadingSpinner({ size = 'md', text = 'Updating telemetry...' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-500">
      <div className={`${sz} border-2 border-slate-900 border-t-transparent rounded-full animate-spin`} />
      <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-600">{text}</span>
    </div>
  );
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 py-12 text-center">
      <div className="w-9 h-9 border border-rose-200 bg-rose-50 rounded-full flex items-center justify-center text-sm font-bold text-rose-600">!</div>
      <p className="text-slate-700 text-xs max-w-sm font-medium">{message || 'Telemetry request error'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary btn-sm mt-1">
          Retry Sync
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = '—', title = 'No data available', subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-400">
      <div className="w-10 h-10 border border-slate-200 bg-slate-50 rounded-lg flex items-center justify-center text-base">{icon}</div>
      <div className="text-center">
        <p className="font-semibold text-slate-800 text-xs">{title}</p>
        {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export function StatCard({ label, value, unit, status = 'NORMAL', target, lastUpdated, icon: Icon, color = 'text-slate-900' }) {
  const getBadgeClass = (st) => {
    const s = String(st || '').toUpperCase();
    if (s.includes('CRITICAL') || s.includes('HIGH') || s.includes('ALARM')) return 'badge-critical';
    if (s.includes('ELEVATED') || s.includes('WARN')) return 'badge-warning';
    if (s.includes('OFFLINE')) return 'badge-offline';
    return 'badge-healthy';
  };

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
        <span className="metric-label">{label}</span>
        {status && <span className={getBadgeClass(status)}>{status}</span>}
      </div>
      <div className="my-1.5">
        <div className={`metric-value ${color}`}>
          {value ?? '—'}
          {unit && <span className="text-xs font-normal text-slate-500 ml-1 font-sans">{unit}</span>}
        </div>
      </div>
      <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1.5 border-t border-slate-100">

        {lastUpdated && <span>Sync: {lastUpdated}</span>}
      </div>
    </div>
  );
}

export function RiskBar({ label, value }) {
  const pct = Math.min(100, Math.max(0, value ?? 0));
  const colorClass =
    pct >= 60 ? 'bg-rose-600' :
    pct >= 30 ? 'bg-amber-600' : 'bg-slate-900';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium text-slate-700">
        <span>{label}</span>
        <span className={pct >= 60 ? 'text-rose-600 font-bold' : pct >= 30 ? 'text-amber-600 font-bold' : 'text-slate-900 font-bold'}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="progress-bar h-2 bg-slate-100">
        <div className={`progress-fill h-2 ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Badge({ severity, children }) {
  const map = {
    critical: 'badge-critical', high: 'badge-high',
    warning:  'badge-warning',  elevated: 'badge-warning',
    healthy:  'badge-healthy',  normal: 'badge-healthy',
    online:   'badge-healthy',  offline: 'badge-offline',
  };
  return <span className={map[severity?.toLowerCase()] || 'badge-info'}>{children}</span>;
}

export function Divider() {
  return <div className="border-t border-slate-200 my-3" />;
}
