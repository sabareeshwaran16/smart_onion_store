import { useState } from 'react';
import { AlertTriangle, Info, XCircle, CheckCircle, Search, Trash2 } from 'lucide-react';
import { mockAlerts } from '../../utils/mockData';
import toast from 'react-hot-toast';

const typeCfg = {
  critical: { Icon: XCircle,       color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  warning:  { Icon: AlertTriangle, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  info:     { Icon: Info,          color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
};

export default function Alerts() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const counts = {
    all:      alerts.length,
    critical: alerts.filter(a => a.type === 'critical').length,
    warning:  alerts.filter(a => a.type === 'warning').length,
    info:     alerts.filter(a => a.type === 'info').length,
    active:   alerts.filter(a => a.status === 'active').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  const filtered = alerts.filter(a => {
    const matchFilter =
      filter === 'all' ||
      a.type === filter ||
      (filter === 'active'   && a.status === 'active') ||
      (filter === 'resolved' && a.status === 'resolved');
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const resolve = id => {
    setAlerts(p => p.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
    toast.success('Alert resolved');
  };
  const remove = id => {
    setAlerts(p => p.filter(a => a.id !== id));
    toast.success('Alert deleted');
  };

  const tabs = [
    { key: 'all',      label: 'All'      },
    { key: 'active',   label: 'Active'   },
    { key: 'critical', label: 'Critical' },
    { key: 'warning',  label: 'Warning'  },
    { key: 'info',     label: 'Info'     },
    { key: 'resolved', label: 'Resolved' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Alerts</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>
          {counts.active} active · {counts.resolved} resolved
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total',    value: counts.all,      color: '#374151', bg: '#f9fafb', border: '#e5e7eb' },
          { label: 'Critical', value: counts.critical, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
          { label: 'Active',   value: counts.active,   color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          { label: 'Resolved', value: counts.resolved, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={13} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts…"
            style={{ width: '100%', padding: '8px 12px 8px 32px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#374151', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tabs.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '6px 14px', borderRadius: 99, border: '1px solid',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: filter === key ? '#2563eb' : '#fff',
              borderColor: filter === key ? '#2563eb' : '#e5e7eb',
              color: filter === key ? '#fff' : '#6b7280',
            }}>
              {label} <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.75 }}>({counts[key] ?? 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
            <CheckCircle size={32} color="#16a34a" style={{ margin: '0 auto 10px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>No alerts found</p>
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>All clear!</p>
          </div>
        ) : filtered.map(a => {
          const { Icon, color, bg, border } = typeCfg[a.type] || typeCfg.info;
          return (
            <div key={a.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={17} color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{a.title}</p>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: bg, color, border: `1px solid ${border}` }}>{a.priority}</span>
                  {a.status === 'resolved' && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>Resolved</span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{a.message}</p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>{a.time}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {a.status === 'active' && (
                  <button onClick={() => resolve(a.id)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Resolve
                  </button>
                )}
                <button onClick={() => remove(a.id)} style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
