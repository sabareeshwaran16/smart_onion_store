import React, { useCallback, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { getBatches, getLatestPrediction, runPrediction, getPredictionHistory } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import PageHeader from '../components/PageHeader';
import { LoadingSpinner, ErrorMessage, EmptyState, RiskBar, StatCard } from '../components/UI';
import { formatNumber, formatDateTime } from '../utils/helpers';

export default function Predictions({ selectedBatchId, onBatchChange }) {
  const [selectedBatch, setSelectedBatch] = useState(selectedBatchId || '');
  const [running, setRunning] = useState(false);

  React.useEffect(() => {
    if (selectedBatchId) {
      setSelectedBatch(selectedBatchId);
    }
  }, [selectedBatchId]);

  const batchesFn = useCallback(() => getBatches(true), []);
  const { data: batches } = useAsync(batchesFn);

  const predFn = useCallback(
    () => (selectedBatch ? getLatestPrediction(selectedBatch) : Promise.resolve({ data: null })),
    [selectedBatch]
  );
  const { data: pred, loading: pLoading, error: pErr, refetch: refetchPred } = useAsync(predFn, [selectedBatch]);

  const histFn = useCallback(
    () => (selectedBatch ? getPredictionHistory(selectedBatch, 30) : Promise.resolve({ data: [] })),
    [selectedBatch]
  );
  const { data: history, refetch: refetchHist } = useAsync(histFn, [selectedBatch]);

  const handleRunPrediction = async () => {
    if (!selectedBatch) return;
    setRunning(true);
    try {
      await runPrediction(selectedBatch);
      refetchPred();
      refetchHist();
    } catch (e) {
      alert(e?.response?.data?.detail || 'Prediction execution error');
    } finally {
      setRunning(false);
    }
  };

  const chartData = (history || []).map((h) => ({
    time: formatDateTime(h.recorded_at),
    'Health Score': h.health_score,
    'Rot Risk': h.rot_risk,
    'Sprout Risk': h.sprouting_risk,
    'Spoilage Risk': h.spoilage_risk,
  }));

  const radarData = pred ? [
    { subject: 'Rot Risk',       value: pred.rot_risk || 0 },
    { subject: 'Sprout Risk',    value: pred.sprouting_risk || 0 },
    { subject: 'Spoilage Risk',  value: pred.spoilage_risk || 0 },
    { subject: 'Health Score',   value: pred.health_score || 0 },
    { subject: 'Shelf Life %',   value: Math.min(100, (pred.shelf_life_remaining / 90) * 100) },
  ] : [];

  return (
    <div className="space-y-5 text-xs animate-fade-in">
      <PageHeader title="STORAGE QUALITY PREDICTIONS" subtitle="Crop Quality Predictions & Risk Assessment">
        <select
          className="input w-48 text-xs"
          value={selectedBatch}
          onChange={(e) => {
            setSelectedBatch(e.target.value);
            if (onBatchChange) onBatchChange(e.target.value);
          }}
          id="batch-selector"
        >
          <option value="">Select batch…</option>
          {(batches || []).map((b) => (
            <option key={b.batch_id} value={b.batch_id}>{b.batch_id}</option>
          ))}
        </select>
        <button
          onClick={handleRunPrediction}
          disabled={!selectedBatch || running}
          className="btn-primary btn-sm"
          id="run-prediction-btn"
        >
          {running ? <RefreshCw size={13} className="animate-spin" /> : null}
          Calculate Risk
        </button>
      </PageHeader>

      {!selectedBatch ? (
        <EmptyState icon="📦" title="Select a Batch" subtitle="Select an active batch to load storage predictions." />
      ) : pLoading ? (
        <LoadingSpinner text="Computing crop quality and degradation risks..." />
      ) : pErr ? (
        <ErrorMessage message={pErr} onRetry={refetchPred} />
      ) : !pred ? (
        <EmptyState icon="📊" title="No Prediction Loaded" subtitle='Click "Calculate Risk" to compute batch risk scores.' />
      ) : (
        <>
          {/* Telemetry Summary Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <StatCard
              label="STORAGE HEALTH"
              value={formatNumber(pred.health_score, 0)}
              unit="/ 100"
              status={pred.health_score >= 75 ? 'NORMAL' : 'WARNING'}
              color={pred.health_score >= 75 ? 'text-emerald-700' : 'text-amber-600'}
            />
            <StatCard
              label="ESTIMATED SHELF LIFE"
              value={formatNumber(pred.shelf_life_remaining, 0)}
              unit="days"
              status="ESTIMATED"
              color="text-slate-900"
            />
            <StatCard
              label="ESTIMATED CURRENT WEIGHT"
              value={formatNumber(pred.estimated_current_weight, 1)}
              unit="kg"
              status="CALCULATED"
              color="text-slate-900"
            />
            <StatCard
              label="ESTIMATED WEIGHT LOSS"
              value={formatNumber(pred.weight_loss_percentage, 2)}
              unit="%"
              status={pred.weight_loss_percentage > 5 ? 'ELEVATED' : 'NORMAL'}
              color="text-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Risk Breakdown Table */}
            <div className="card-lg flex flex-col justify-between space-y-4">
              <div>
                <div className="section-title">PREDICTED RISK BREAKDOWN</div>
                <div className="space-y-3">
                  <RiskBar label="Rot Risk"       value={pred.rot_risk} />
                  <RiskBar label="Sprouting Risk" value={pred.sprouting_risk} />
                  <RiskBar label="Spoilage Risk"  value={pred.spoilage_risk} />
                </div>
              </div>
              
              <table className="scada-table mt-4 pt-3 border-t border-slate-100">
                <tbody>
                  <tr>
                    <td className="text-slate-500">Model Source</td>
                    <td className="text-emerald-700 text-right font-bold">{pred.model_source || 'Quality Prediction Model'}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500">Model Confidence</td>
                    <td className="text-slate-800 text-right">{formatNumber(pred.confidence, 1)}%</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500">Prediction Date</td>
                    <td className="text-slate-800 text-right">{formatDateTime(pred.prediction_time)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Radar Analysis */}
            <div className="card-lg flex flex-col justify-between space-y-3">
              <div className="section-title">STORAGE RISK PROFILE RADAR</div>
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                    <Radar dataKey="value" stroke="#0f172a" fill="#0f172a" fillOpacity={0.12} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Environmental Factors */}
          {pred.explanation && Object.keys(pred.explanation).length > 0 && (
            <div className="card-lg space-y-3">
              <div className="section-title">ENVIRONMENTAL RISK FACTOR ANALYSIS</div>
              
              {pred.explanation.factors && Array.isArray(pred.explanation.factors) ? (
                <div className="space-y-1.5 mb-3">
                  {pred.explanation.factors.map((f, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-slate-900 font-bold">•</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(pred.explanation)
                  .filter(([k]) => k !== 'factors')
                  .map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{key.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-slate-900 font-bold mt-0.5 capitalize">
                        {typeof val === 'number' ? formatNumber(val, 1) : String(val)}
                      </p>
                    </div>
                ))}
              </div>
            </div>
          )}

          {/* History Chart */}
          {chartData.length > 1 && (
            <div className="card-lg space-y-3">
              <div className="section-title">HISTORICAL PREDICTION TRENDS</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: 8, color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="Health Score" stroke="#0f172a" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Rot Risk" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="Sprout Risk" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="Spoilage Risk" stroke="#ea580c" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
