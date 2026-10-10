import React, { useCallback, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { getAlerts, resolveAlert } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import PageHeader from '../components/PageHeader';
import { LoadingSpinner, ErrorMessage, EmptyState, Badge } from '../components/UI';
import { formatDateTime, formatNumber } from '../utils/helpers';

const SEVERITY_COLORS = {
  critical: 'alert-row-critical',
  high:     'alert-row-high',
  warning:  'alert-row-warning',
  info:     'alert-row-info',
};

const SEVERITY_ICON = {
  critical: '🔴',
  high:     '🟠',
  warning:  '🟡',
  info:     '🔵',
};

export default function Alerts() {
  const [showResolved, setShowResolved] = useState(false);
  const [resolving, setResolving] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('all');

  const fetchFn = useCallback(() => getAlerts(showResolved), [showResolved]);
  const { data: alerts, loading, error, refetch } = useAsync(fetchFn, [showResolved]);

  const handleResolve = async (id) => {
    setResolving(id);
    try {
      await resolveAlert(id);
      refetch();
    } catch (e) {
      alert(e?.response?.data?.detail || 'Failed to resolve');
    } finally {
      setResolving(null);
    }
  };

  const filtered = (alerts || []).filter(
    (a) => severityFilter === 'all' || a.severity?.toLowerCase() === severityFilter
  );

  const counts = (alerts || []).reduce((acc, a) => {
    const s = a.severity?.toLowerCase() || 'info';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Alerts"
        subtitle={`${showResolved ? 'Resolved' : 'Active'} storage condition alerts`}
        onRefresh={refetch}
        loading={loading}
      >
        <button
          onClick={() => setShowResolved((v) => !v)}
          className={showResolved ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
          id="toggle-resolved-btn"
        >
          {showResolved ? 'Show Active' : 'Show Resolved'}
        </button>
      </PageHeader>

      {/* Summary badges */}
      {!showResolved && alerts?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {['all', 'critical', 'high', 'warning', 'info'].map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                severityFilter === s
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s === 'all' ? `All (${alerts.length})` : `${SEVERITY_ICON[s]} ${s} (${counts[s] || 0})`}
            </button>
          ))}
        </div>
      )}

      {loading && !alerts ? <LoadingSpinner text="Loading alerts..." /> :
       error ? <ErrorMessage message={error} onRetry={refetch} /> :
       filtered.length === 0 ? (
        <EmptyState
          icon={showResolved ? '✅' : '🔔'}
          title={showResolved ? 'No resolved alerts' : 'No active alerts'}
          subtitle={!showResolved ? 'All storage parameters are within safe operational thresholds.' : undefined}
        />
       ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className={`${SEVERITY_COLORS[a.severity?.toLowerCase()] || 'alert-row-info'} animate-slide-up flex items-center justify-between`}>
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="text-sm flex-shrink-0 mt-0.5">{SEVERITY_ICON[a.severity?.toLowerCase()] || '🔵'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1.5">
                    <Badge severity={a.severity}>{a.severity?.toUpperCase()}</Badge>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{a.alert_type?.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase">{formatDateTime(a.created_at)}</span>
                  </div>
                  <p className="text-xs text-slate-900 font-semibold leading-relaxed">{a.message}</p>
                  {(a.current_value != null || a.threshold_value != null) && (
                    <p className="text-[10px] text-slate-600 mt-1 uppercase font-semibold">
                      Current Value: <span className="text-slate-900 font-bold">{formatNumber(a.current_value)}</span>
                      {' '}/ Warning Threshold: <span className="text-slate-900 font-bold">{formatNumber(a.threshold_value)}</span>
                    </p>
                  )}
                  {a.recommendation && (
                    <p className="text-xs text-slate-700 font-medium mt-1.5 flex items-start gap-1">
                      <span className="font-semibold text-slate-900">→ Recommendation:</span>
                      <span>{a.recommendation}</span>
                    </p>
                  )}
                </div>
              </div>
              {!a.is_resolved && (
                <button
                  onClick={() => handleResolve(a.id)}
                  disabled={resolving === a.id}
                  className="btn-secondary btn-sm p-1.5 flex-shrink-0 text-emerald-700 hover:text-emerald-900 transition-colors"
                  title="Mark resolved"
                >
                  <CheckCircle size={17} />
                </button>
              )}
            </div>
          ))}
        </div>
       )}
    </div>
  );
}
