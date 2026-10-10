import React, { useCallback, useState } from 'react';
import { Thermometer, Droplets, Wind } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { getLatestSensor, getSensorHistory } from '../api/client';
import { usePolling } from '../hooks/useAsync';
import PageHeader from '../components/PageHeader';
import { LoadingSpinner, ErrorMessage, StatCard } from '../components/UI';
import { formatNumber, formatTime } from '../utils/helpers';

const HOURS_OPTIONS = [6, 12, 24, 48];

export default function Sensors({ selectedBatchId }) {
  const [hours, setHours] = useState(24);
  const deviceId = 'ESP32_001';

  const latestFn = useCallback(() => getLatestSensor(deviceId), [deviceId]);
  const { data: latest, loading: lLoading, refetch: refetchLatest } = usePolling(latestFn, 3500, [deviceId]);

  const historyFn = useCallback(() => getSensorHistory(100, hours, deviceId), [deviceId, hours]);
  const { data: history, loading: hLoading, error, refetch: refetchHistory } = usePolling(historyFn, 3500, [deviceId, hours]);

  const chartData = (history || []).map((r) => ({
    time: formatTime(r.timestamp),
    Temperature: r.temperature != null ? Number(r.temperature).toFixed(1) : '—',
    Humidity: r.humidity != null ? Number(r.humidity).toFixed(1) : '—',
    'Gas (ppm)': r.gas_value != null ? Number(r.gas_value).toFixed(0) : '—',
  }));

  const refetch = () => { refetchLatest(); refetchHistory(); };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Sensor Telemetry"
        subtitle="Live environmental telemetry and historical trends"
        onRefresh={refetch}
        loading={lLoading || hLoading}
        lastUpdated={latest?.timestamp}
      />

      {/* Live KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Temperature" value={formatNumber(latest?.temperature)} unit="°C" icon={Thermometer}
          color={latest?.temperature > 30 ? 'text-rose-600' : 'text-slate-900'}
          sub={latest?.temperature > 30 ? 'Above optimal' : 'In range'}
          warn={latest?.temperature > 30}
        />
        <StatCard
          label="Humidity" value={formatNumber(latest?.humidity)} unit="%" icon={Droplets}
          color={latest?.humidity > 80 ? 'text-amber-600' : 'text-slate-900'}
          sub={latest?.humidity > 80 ? 'Too humid' : 'In range'}
          warn={latest?.humidity > 80}
        />
        <StatCard
          label="MQ-135 Gas Index" value={formatNumber(latest?.gas_value, 0)} unit="ppm" icon={Wind}
          color={latest?.gas_value > 400 ? 'text-rose-600' : 'text-slate-900'}
          sub={latest?.gas_value > 400 ? 'Elevated gas' : 'Normal'}
          warn={latest?.gas_value > 400}
        />
      </div>

      {/* History Controls */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Show last:</span>
        {HOURS_OPTIONS.map((h) => (
          <button
            key={h}
            onClick={() => setHours(h)}
            className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-md font-semibold transition-all ${
              hours === h
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {h}h
          </button>
        ))}
      </div>

      {/* Charts */}
      {error ? (
        <ErrorMessage message={error} onRetry={refetchHistory} />
      ) : hLoading && !history ? (
        <LoadingSpinner text="Loading sensor history..." />
      ) : (
        <div className="space-y-5">
          {/* Temperature */}
          <div className="card-lg">
            <div className="section-title"><Thermometer size={14} className="text-slate-700" />Temperature (°C)</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="Temperature" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Humidity */}
          <div className="card-lg">
            <div className="section-title"><Droplets size={14} className="text-slate-700" />Humidity (%)</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="Humidity" stroke="#0284c7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gas */}
          <div className="card-lg">
            <div className="section-title"><Wind size={14} className="text-slate-700" />Gas / VOC (ppm)</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="Gas (ppm)" stroke="#d97706" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Raw table */}
      {history && history.length > 0 && (
        <div className="card-lg overflow-auto">
          <div className="section-title">Recent Readings</div>
          <table className="scada-table">
            <thead>
              <tr>
                <th>Time</th>
                <th className="text-right">Temp (°C)</th>
                <th className="text-right">Humidity (%)</th>
                <th className="text-right">Gas (ppm)</th>
              </tr>
            </thead>
            <tbody>
              {[...history].reverse().slice(0, 15).map((r, i) => (
                <tr key={i}>
                  <td className="font-medium text-slate-700">{formatTime(r.timestamp)}</td>
                  <td className="text-right font-semibold text-slate-900">{formatNumber(r.temperature)}</td>
                  <td className="text-right font-semibold text-slate-900">{formatNumber(r.humidity)}</td>
                  <td className="text-right font-semibold text-slate-900">{formatNumber(r.gas_value, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
