import { useState, useMemo } from 'react';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockHistory } from '../../utils/mockData';

const PAGE_SIZE = 10;

export default function History() {
  const [search, setSearch]     = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [page, setPage]         = useState(1);

  const filtered = useMemo(() => mockHistory.filter(r => {
    const d = new Date(r.date);
    return (
      (!dateFrom || d >= new Date(dateFrom)) &&
      (!dateTo   || d <= new Date(dateTo + 'T23:59:59')) &&
      (!search   || r.temperature.toString().includes(search) ||
                    r.humidity.toString().includes(search) ||
                    r.fanStatus.toLowerCase().includes(search.toLowerCase()))
    );
  }), [search, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    const h = ['Date','Temp','Humidity','Gas','Health','Spoilage','Fan'];
    const body = filtered.map(r => [new Date(r.date).toLocaleString(), r.temperature, r.humidity, r.gas, r.healthScore, r.spoilageRisk, r.fanStatus]);
    const csv = [h, ...body].map(r => r.join(',')).join('\n');
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'history.csv' }).click();
  };

  const inputSt = {
    background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8,
    padding: '8px 12px', fontSize: 13, color: '#374151', outline: 'none',
  };

  const badge = (val, low, mid) => ({
    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
    background: val <= low ? '#f0fdf4' : val <= mid ? '#fefce8' : '#fef2f2',
    color:      val <= low ? '#16a34a' : val <= mid ? '#ca8a04' : '#dc2626',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>History</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>{filtered.length} records found</p>
        </div>
        <button onClick={exportCSV} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={13} color="#9ca3af" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search records..."
            style={{ ...inputSt, paddingLeft: 32, width: '100%' }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
          style={inputSt}
          onFocus={e => e.target.style.borderColor = '#2563eb'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
          style={inputSt}
          onFocus={e => e.target.style.borderColor = '#2563eb'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Date & Time','Temp °C','Humidity %','Gas ppm','Health Score','Spoilage Risk','Fan'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', fontSize: 13 }}>No records found</td></tr>
              ) : rows.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>{new Date(r.date).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ea580c' }}>{r.temperature}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0891b2' }}>{r.humidity}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#7c3aed' }}>{r.gas}</td>
                  <td style={{ padding: '12px 16px' }}><span style={badge(100 - r.healthScore, 20, 40)}>{r.healthScore}</span></td>
                  <td style={{ padding: '12px 16px' }}><span style={badge(r.spoilageRisk, 20, 40)}>{r.spoilageRisk}%</span></td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                      background: r.fanStatus === 'ON' ? '#f0fdf4' : '#f9fafb',
                      color: r.fanStatus === 'ON' ? '#16a34a' : '#9ca3af',
                    }}>{r.fanStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: 12, color: '#9ca3af' }}>Page {page} of {totalPages} · {filtered.length} records</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { Icon: ChevronLeft,  fn: () => setPage(p => Math.max(1, p - 1)),           disabled: page === 1 },
              { Icon: ChevronRight, fn: () => setPage(p => Math.min(totalPages, p + 1)),  disabled: page === totalPages },
            ].map(({ Icon, fn, disabled }, i) => (
              <button key={i} onClick={fn} disabled={disabled} style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb',
                background: '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
                color: disabled ? '#d1d5db' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
