import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../api/client';
import { usePolling } from '../hooks/useAsync';
import { StatCard, Badge } from '../components/UI';
import { formatNumber, formatTime } from '../utils/helpers';

export default function Home({ selectedBatchId }) {
  const fetchFn = useCallback(() => getDashboard(selectedBatchId), [selectedBatchId]);
  const { data } = usePolling(fetchFn, 3500, [selectedBatchId]);

  const { sensor, prediction, batch } = data || {};

  const tempVal = sensor?.temperature ?? 28.4;
  const humVal = sensor?.humidity ?? 63.0;
  const gasVal = sensor?.gas_value ?? 977;
  const healthVal = prediction?.health_score;

  const tempStatus = tempVal > 30 ? 'ELEVATED' : 'NORMAL';
  const humStatus = humVal > 75 ? 'HIGH' : humVal < 55 ? 'LOW' : 'NORMAL';
  const gasStatus = gasVal > 400 ? 'ELEVATED' : 'NORMAL';

  const syncTime = sensor?.timestamp ? formatTime(sensor.timestamp) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-5 text-xs animate-fade-in">
      
      {/* Overview Header Panel */}
      <div className="card-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Onion Storage Monitoring</h1>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Facility Control System</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Real-time environmental telemetry, crop retention, and storage analytics.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <div>
              <span className="text-slate-500 uppercase font-semibold block text-[10px]">Active Batch</span>
              <span className="text-slate-900 font-bold">{batch?.batch_id || selectedBatchId || 'ONION-2026-09'}</span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-slate-500 uppercase font-semibold block text-[10px]">Storage Unit</span>
              <span className="text-slate-800 font-bold">{batch?.warehouse || batch?.location || 'Unit 01'}</span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-slate-500 uppercase font-semibold block text-[10px]">System Status</span>
              <span className="badge-healthy">● Online</span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-slate-500 uppercase font-semibold block text-[10px]">Last Sync</span>
              <span className="text-slate-700 font-medium">{syncTime}</span>
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2.5 pt-1 text-[11px]">
          <Link to="/dashboard" className="btn-primary btn-sm">
            Open Dashboard →
          </Link>


        </div>
      </div>

      {/* Sensor Monitoring Panels Grid */}
      <div>
        <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2.5">Live Environmental Telemetry</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Temperature */}
          <StatCard
            label="TEMPERATURE"
            value={formatNumber(tempVal, 1)}
            unit="°C"
            status={tempStatus}
            target="20–30 °C"
            lastUpdated={syncTime}
            color={tempVal > 30 ? 'text-amber-600' : 'text-slate-900'}
          />

          {/* Humidity */}
          <StatCard
            label="HUMIDITY"
            value={formatNumber(humVal, 1)}
            unit="%"
            status={humStatus}
            target="60–75 %"
            lastUpdated={syncTime}
            color={humVal > 75 ? 'text-amber-600' : 'text-slate-900'}
          />

          {/* Gas Index (MQ-135) */}
          <StatCard
            label="MQ-135 GAS INDEX"
            value={formatNumber(gasVal, 0)}
            unit="ppm"
            status={gasStatus}
            target="Baseline: <400"
            lastUpdated={syncTime}
            color={gasVal > 400 ? 'text-amber-600' : 'text-slate-900'}
          />

          {/* Storage Health */}
          <StatCard
            label="STORAGE HEALTH INDEX"
            value={healthVal != null ? `${formatNumber(healthVal, 0)} / 100` : 'Pending'}
            status={prediction ? (healthVal >= 75 ? 'NORMAL' : 'WARNING') : 'OFFLINE'}
            target={prediction ? 'Min: 70 / 100' : 'Telemetry pending'}
            lastUpdated={syncTime}
            color={healthVal >= 75 ? 'text-emerald-700' : healthVal != null ? 'text-amber-600' : 'text-slate-500'}
          />

        </div>
      </div>

      {/* Operational Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Active Batch Summary */}
        <div className="lg:col-span-6 card-lg space-y-3">
          <div className="section-title">
            <span>CURRENT BATCH SUMMARY</span>
          </div>

          <table className="scada-table">
            <tbody>
              <tr>
                <td className="text-slate-500">Batch ID</td>
                <td className="font-bold text-slate-900 text-right">{batch?.batch_id || selectedBatchId || 'ONION-2026-09'}</td>
              </tr>
              <tr>
                <td className="text-slate-500">Storage Unit / Location</td>
                <td className="font-semibold text-slate-800 text-right">{batch?.warehouse || batch?.location || 'Unit 01'}</td>
              </tr>
              <tr>
                <td className="text-slate-500">Onion Variety</td>
                <td className="font-semibold text-slate-800 text-right">{batch?.onion_variety || 'Red Globe'}</td>
              </tr>
              <tr>
                <td className="text-slate-500">Storage Start Date</td>
                <td className="text-slate-800 text-right">{batch?.storage_start_date || '2026-08-15'}</td>
              </tr>
              <tr>
                <td className="text-slate-500">Days in Storage</td>
                <td className="font-bold text-slate-900 text-right">{batch?.storage_days ?? 35} days</td>
              </tr>
              <tr>
                <td className="text-slate-500">Initial Weight</td>
                <td className="text-slate-800 text-right">{batch?.initial_weight ?? 1000} kg</td>
              </tr>
              <tr>
                <td className="text-slate-500">Estimated Current Weight</td>
                <td className="font-bold text-emerald-700 text-right">
                  {prediction?.estimated_current_weight != null ? `${prediction.estimated_current_weight} kg` : 'Calculated on prediction'}
                </td>
              </tr>
              <tr>
                <td className="text-slate-500">Estimated Cumulative Weight Loss</td>
                <td className="font-semibold text-amber-700 text-right">
                  {prediction?.weight_loss_percentage != null ? `${prediction.weight_loss_percentage}% (${prediction.weight_loss} kg)` : 'Calculated on prediction'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Operational Risk Assessment Table */}
        <div className="lg:col-span-6 card-lg space-y-3">
          <div className="section-title">
            <span>STORAGE RISK ASSESSMENT</span>
          </div>

          {prediction ? (
            <table className="scada-table">
              <thead>
                <tr>
                  <th>Risk Metric</th>
                  <th className="text-right">Estimated Value</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Rot Risk</td>
                  <td className="text-right font-bold text-slate-900">{prediction.rot_risk?.toFixed(1)}%</td>
                  <td className="text-right"><Badge severity={prediction.rot_risk > 30 ? 'warning' : 'healthy'}>{prediction.rot_risk > 30 ? 'ELEVATED' : 'NORMAL'}</Badge></td>
                </tr>
                <tr>
                  <td>Sprouting Risk</td>
                  <td className="text-right font-bold text-slate-900">{prediction.sprouting_risk?.toFixed(1)}%</td>
                  <td className="text-right"><Badge severity={prediction.sprouting_risk > 30 ? 'warning' : 'healthy'}>{prediction.sprouting_risk > 30 ? 'ELEVATED' : 'NORMAL'}</Badge></td>
                </tr>
                <tr>
                  <td>Spoilage Risk</td>
                  <td className="text-right font-bold text-slate-900">{prediction.spoilage_risk?.toFixed(1)}%</td>
                  <td className="text-right"><Badge severity={prediction.spoilage_risk > 30 ? 'warning' : 'healthy'}>{prediction.spoilage_risk > 30 ? 'ELEVATED' : 'NORMAL'}</Badge></td>
                </tr>
                <tr>
                  <td>Estimated Shelf Life</td>
                  <td className="text-right font-bold text-emerald-700">{prediction.shelf_life_remaining} days</td>
                  <td className="text-right"><Badge severity="info">ESTIMATED</Badge></td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="p-4 border border-slate-200 bg-slate-50 text-slate-500 text-center text-xs rounded-md">
              Model prediction unavailable. Run prediction on active batch to load risks.
            </div>
          )}

          {/* Operational Factors */}
          {prediction?.explanation?.factors && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">ENVIRONMENTAL RISK FACTORS:</span>
              <ul className="space-y-1">
                {prediction.explanation.factors.map((factor, idx) => (
                  <li key={idx} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                    <span className="text-slate-400">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
