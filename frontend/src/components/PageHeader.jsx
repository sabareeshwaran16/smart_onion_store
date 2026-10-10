import React from 'react';
import { RefreshCw } from 'lucide-react';
import { formatDateTime } from '../utils/helpers';

export default function PageHeader({ title, subtitle, onRefresh, loading, lastUpdated, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 pb-4 border-b border-slate-200 gap-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
        {lastUpdated && (
          <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">
            Last Sync: {formatDateTime(lastUpdated)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {children}
        {onRefresh && (
          <button 
            onClick={onRefresh} 
            disabled={loading} 
            className="btn-secondary btn-sm" 
            id="header-refresh-btn"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Sync
          </button>
        )}
      </div>
    </div>
  );
}
