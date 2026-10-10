import React, { useCallback, useState } from 'react';
import { BarChart2, TrendingUp, Activity, Leaf, Droplets, Thermometer } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, BarChart, Bar, AreaChart, Area
} from 'recharts';
import { getBatches, getAnalytics } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import PageHeader from '../components/PageHeader';
import { LoadingSpinner, ErrorMessage, StatCard } from '../components/UI';
import { formatNumber, formatTime, formatDateTime } from '../utils/helpers';

const DAYS_OPTIONS = [7, 14, 30, 60];

export default function Analytics({ selectedBatchId, onBatchChange }) {
  const [selectedBatch, setSelectedBatch] = useState(selectedBatchId || '');
  const [days, setDays] = useState(30);

  const batchesFn = useCallback(() => getBatches(), []);
  const { data: batches } = useAsync(batchesFn);

  React.useEffect(() => {
    if (selectedBatchId) setSelectedBatch(selectedBatchId);
  }, [selectedBatchId]);

  const analyticsFn = useCallback(
    () => getAnalytics(selectedBatch || undefined, days),
    [selectedBatch, days]
  );
  const { data, loading, error, refetch } = useAsync(analyticsFn, [selectedBatch, days]);

  const sensorChart = (data?.sensor_trends || []).map((s) => ({
    time: formatTime(s.timestamp),
    Temp: Number(s.temperature).toFixed(1),
    Humidity: Number(s.humidity).toFixed(1),
    Gas: Number(s.gas_value).toFixed(0),
  }));

  const predChart = (data?.prediction_trends || []).map((p) => ({
    time: formatDateTime(p.timestamp),
    'Health Score': p.health_score,
    'Rot Risk': p.rot_risk,
    'Spoilage Risk': p.spoilage_risk,
    'Sprouting Risk': p.sprouting_risk,
    'Weight (kg)': p.estimated_current_weight,
    'Shelf Life (days)': p.shelf_life_remaining,
  }));

  const summary = data?.summary || {};

  // Derive summary stats from prediction trends if no sensor data
  const predSummary = predChart.length > 0 ? {
    avgHealth: (predChart.reduce((a, b) => a + (b['Health Score'] || 0), 0) / predChart.length).toFixed(1),
    avgRotRisk: (predChart.reduce((a, b) => a + (b['Rot Risk'] || 0), 0) / predChart.length).toFixed(1),
    avgWeight: (predChart.reduce((a, b) => a + (b['Weight (kg)'] || 0), 0) / predChart.length).toFixed(0),
    avgShelfLife: (predChart.reduce((a, b) => a + (b['Shelf Life (days)'] || 0), 0) / predChart.length).toFixed(0),
  } : null;

  return (
    <div className="animate-fade-in space-y-5 text-xs">
      <PageHeader
        title="Analytics"
        subtitle="Historical telemetry trends and storage performance"
        onRefresh={refetch}
        loading={loading}
      >
        <select
          className="input w-40 text-xs"
          value={selectedBatch}
          onChange={(e) => {
            setSelectedBatch(e.target.value);
            if (onBatchChange) onBatchChange(e.target.value);
          }}
        >
          <option value="">All Batches</option>
          {(batches || []).map((b) => (
            <option key={b.batch_id} value={b.batch_id}>{b.batch_id}</option>
          ))}
        </select>
        <div className="flex gap-1">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-md transition-all ${
                days === d
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >{d}d</button>
          ))}
        </div>
      </PageHeader>

      {loading && !data ? (
        <LoadingSpinner text="Loading analytics..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : (
        <div className="space-y-5">

          {/* Summary Cards — from sensor data or prediction data */}
          {summary.avg_temperature != null ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Avg Temperature" value={formatNumber(summary.avg_temperature)} unit="°C" />
              <StatCard label="Avg Humidity"    value={formatNumber(summary.avg_humidity)}    unit="%" />
              <StatCard label="Avg Gas Index"   value={formatNumber(summary.avg_gas, 0)}      unit="ppm" />
              <StatCard label="Total Readings"  value={summary.total_readings || 0} />
            </div>
          ) : predSummary ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Avg Health Score"   value={predSummary.avgHealth}    unit="/ 100" />
              <StatCard label="Avg Rot Risk"        value={predSummary.avgRotRisk}   unit="%" />
              <StatCard label="Avg Stored Weight"   value={predSummary.avgWeight}    unit="kg" />
              <StatCard label="Avg Shelf Life Left" value={predSummary.avgShelfLife} unit="days" />
            </div>
          ) : null}

          {/* Prediction Quality Trends */}
          {predChart.length > 1 ? (
            <div className="card-lg space-y-3">
              <div className="section-title">
                <TrendingUp size={14} className="text-slate-700" />
                <span>QUALITY PREDICTION TRENDS</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={predChart}>
                  <defs>
                    <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0f172a" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="rotGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="Health Score"   stroke="#0f172a" fill="url(#healthGrad)" strokeWidth={2} dot={predChart.length < 10} />
                  <Area type="monotone" dataKey="Rot Risk"       stroke="#ef4444" fill="url(#rotGrad)"    strokeWidth={1.5} dot={predChart.length < 10} />
                  <Line  type="monotone" dataKey="Spoilage Risk" stroke="#f59e0b" strokeWidth={1.5} dot={predChart.length < 10} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : predChart.length === 1 ? (
            <div className="card-lg p-6 text-center">
              <div className="text-slate-400 text-3xl mb-2">📊</div>
              <p className="font-bold text-slate-700">1 prediction recorded</p>
              <p className="text-slate-500 mt-1">Run more predictions to see trend charts over time.</p>
            </div>
          ) : (
            <div className="card-lg p-6 text-center">
              <div className="text-slate-400 text-3xl mb-2">📊</div>
              <p className="font-bold text-slate-700">No prediction history</p>
              <p className="text-slate-500 mt-1">Run predictions to track quality trends over time.</p>
            </div>
          )}

          {/* Weight Trend */}
          {predChart.length > 1 && (
            <div className="card-lg space-y-3">
              <div className="section-title">
                <Leaf size={14} className="text-slate-700" />
                <span>ESTIMATED STORED WEIGHT TREND (kg)</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={predChart}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0284c7" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="Weight (kg)" stroke="#0284c7" fill="url(#weightGrad)" strokeWidth={2} dot={predChart.length < 10} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Sensor Trends */}
          {sensorChart.length > 1 ? (
            <>
              <div className="card-lg space-y-3">
                <div className="section-title">
                  <Thermometer size={14} className="text-slate-700" />
                  <span>SENSOR TRENDS — TEMPERATURE & HUMIDITY</span>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={sensorChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis yAxisId="temp" domain={['auto','auto']} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis yAxisId="hum"  orientation="right" domain={['auto','auto']} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line yAxisId="temp" type="monotone" dataKey="Temp"     stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line yAxisId="hum"  type="monotone" dataKey="Humidity" stroke="#0284c7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card-lg space-y-3">
                <div className="section-title">
                  <Activity size={14} className="text-slate-700" />
                  <span>GAS / VOC TREND (ppm)</span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={sensorChart.filter((_, i) => i % Math.max(1, Math.floor(sensorChart.length / 50)) === 0)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="Gas" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="card-lg p-5">
              <div className="section-title mb-3">
                <Droplets size={14} className="text-slate-700" />
                <span>SENSOR HISTORY</span>
              </div>
              <div className="p-4 border border-slate-200 bg-slate-50 rounded-md text-slate-500 text-center">
                No sensor history data available for this period.
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
