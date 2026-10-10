import React, { useCallback } from 'react';
import { getDashboard } from '../api/client';
import { usePolling } from '../hooks/useAsync';
import PageHeader from '../components/PageHeader';
import { LoadingSpinner, ErrorMessage, Badge } from '../components/UI';

export default function Guidelines({ selectedBatchId }) {
  const fetchFn = useCallback(() => getDashboard(selectedBatchId), [selectedBatchId]);
  const { data, loading, error, refetch } = usePolling(fetchFn, 5000, [selectedBatchId]);

  if (loading && !data) return <LoadingSpinner text="Loading operational guidelines..." />;
  if (error && !data) return <ErrorMessage message={error} onRetry={refetch} />;

  const { recommendations } = data || {};

  return (
    <div className="space-y-5 text-xs animate-fade-in">
      <PageHeader
        title="Storage Operational Guidelines"
        subtitle="Active recommendations and required actions for the current batch"
      />

      <div className="card-lg space-y-4">
        <div className="section-title">
          <span>OPERATIONAL GUIDELINES</span>
          {recommendations?.length > 0 && (
            <span className="badge-critical">{recommendations.length} ACTIVE</span>
          )}
        </div>

        {recommendations?.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((r) => (
              <div key={r.id} className="p-4 rounded-md border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge severity={r.priority}>{r.priority?.toUpperCase()}</Badge>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {r.category}
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 mb-1">{r.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{r.message}</p>
                {r.action && (
                  <p className="text-[11px] text-emerald-700 font-bold mt-2">
                    ▶ Required Action: {r.action}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 rounded-md font-medium">
            <span className="font-bold">✓</span>
            <span>No active storage guidelines required. All parameters within target ranges.</span>
          </div>
        )}
      </div>
    </div>
  );
}
