import React, { useCallback } from 'react';
import { getDashboard } from '../api/client';
import { usePolling } from '../hooks/useAsync';
import PageHeader from '../components/PageHeader';
import { LoadingSpinner, ErrorMessage, StatCard, RiskBar, Badge } from '../components/UI';
import { formatDateTime, formatNumber, formatDate } from '../utils/helpers';

export default function Dashboard({ selectedBatchId }) {
  const fetchFn = useCallback(() => getDashboard(selectedBatchId), [selectedBatchId]);
  const { data, loading, error, refetch } = usePolling(fetchFn, 3500, [selectedBatchId]);

  if (loading && !data) return <LoadingSpinner text="Connecting storage telemetry interface..." />;
  if (error && !data) return <ErrorMessage message={error} onRetry={refetch} />;

  const { batch, sensor, prediction, weather, alerts, recommendations, device } = data || {};
  const isDemo = prediction?.is_demo;

  const tempVal = sensor?.temperature ?? 28.4;
  const humVal = sensor?.humidity ?? 63.0;
  const gasVal = sensor?.gas_value ?? 977;
  const healthVal = prediction?.health_score;

  const tempStatus = tempVal > 30 ? 'ELEVATED' : 'NORMAL';
  const humStatus = humVal > 75 ? 'HIGH' : humVal < 55 ? 'LOW' : 'NORMAL';
  const gasStatus = gasVal > 400 ? 'ELEVATED' : 'NORMAL';

  const syncTime = sensor?.timestamp ? formatDateTime(sensor.timestamp) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-5 text-xs animate-fade-in">
      {error && data && (
        <div className="text-xs py-2 px-3.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between">
          <span>⚠️ Telemetry sync warning: {error}. Displaying last recorded values.</span>
          <button onClick={refetch} className="underline hover:text-amber-950 font-bold ml-2">Retry Sync</button>
        </div>
      )}



      <PageHeader
        title="STORAGE CONTROL DASHBOARD"
        subtitle="Real-Time Telemetry & Batch Storage Monitoring"
        onRefresh={refetch}
        loading={loading}
        lastUpdated={sensor?.timestamp}
      />

      {/* Sensor Panels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          label="TEMPERATURE"
          value={formatNumber(tempVal, 1)}
          unit="°C"
          status={tempStatus}
          target="20–30 °C"
          lastUpdated={syncTime}
          color={tempVal > 30 ? 'text-amber-600' : 'text-slate-900'}
        />
        <StatCard
          label="HUMIDITY"
          value={formatNumber(humVal, 1)}
          unit="%"
          status={humStatus}
          target="60–75 %"
          lastUpdated={syncTime}
          color={humVal > 75 ? 'text-amber-600' : 'text-slate-900'}
        />
        <StatCard
          label="MQ-135 GAS INDEX"
          value={formatNumber(gasVal, 0)}
          unit="ppm"
          status={gasStatus}
          target="Baseline: <400"
          lastUpdated={syncTime}
          color={gasVal > 400 ? 'text-amber-600' : 'text-slate-900'}
        />
        <StatCard
          label="STORAGE HEALTH INDEX"
          value={healthVal != null ? `${formatNumber(healthVal, 0)} / 100` : 'Pending'}
          status={prediction ? (healthVal >= 75 ? 'NORMAL' : 'WARNING') : 'OFFLINE'}
          target={prediction ? 'Min: 70 / 100' : 'Awaiting data'}
          lastUpdated={syncTime}
          color={healthVal >= 75 ? 'text-emerald-700' : healthVal != null ? 'text-amber-600' : 'text-slate-500'}
        />
      </div>

      {/* Main Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Current Batch Panel */}
        <div className="card-lg space-y-3">
          <div className="section-title">
            <span>CURRENT BATCH DETAILS</span>
          </div>
          {batch ? (
            <table className="scada-table">
              <tbody>
                <tr>
                  <td className="text-slate-500">Batch ID</td>
                  <td className="font-bold text-slate-900 text-right">{batch.batch_id}</td>
                </tr>
                <tr>
                  <td className="text-slate-500">Storage Unit</td>
                  <td className="font-semibold text-slate-800 text-right">{batch.warehouse || batch.location || 'Unit 01'}</td>
                </tr>
                <tr>
                  <td className="text-slate-500">Variety</td>
                  <td className="font-semibold text-slate-800 text-right">{batch.onion_variety || '—'}</td>
                </tr>
                <tr>
                  <td className="text-slate-500">Initial Weight</td>
                  <td className="text-slate-800 text-right">{batch.initial_weight} kg</td>
                </tr>
                <tr>
                  <td className="text-slate-500">Days in Storage</td>
                  <td className="font-bold text-slate-900 text-right">{batch.storage_days} days</td>
                </tr>
                <tr>
                  <td className="text-slate-500">Expected Retrieval</td>
                  <td className="text-slate-800 text-right">{formatDate(batch.expected_retrieval_date)}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-500">No active batch loaded. Configure batch in Storage.</p>
          )}
        </div>

        {/* Storage Risk Table */}
        <div className="card-lg space-y-3">
          <div className="section-title">
            <span>STORAGE RISK ANALYSIS</span>
          </div>
          {prediction ? (
            <div className="space-y-4">
              <RiskBar label="Rot Risk"       value={prediction.rot_risk} />
              <RiskBar label="Sprouting Risk" value={prediction.sprouting_risk} />
              <RiskBar label="Spoilage Risk"  value={prediction.spoilage_risk} />
              
              <table className="scada-table mt-2 pt-2 border-t border-slate-100">
                <tbody>
                  <tr>
                    <td className="text-slate-500">Estimated Current Weight</td>
                    <td className="font-bold text-emerald-700 text-right">
                      {prediction.estimated_current_weight != null ? `${formatNumber(prediction.estimated_current_weight, 1)} kg` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-slate-500">Estimated Weight Loss</td>
                    <td className="font-semibold text-amber-700 text-right">
                      {prediction.weight_loss_percentage != null ? `${formatNumber(prediction.weight_loss_percentage, 2)}%` : '—'}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-slate-500">Model Source</td>
                    <td className="text-slate-600 text-right text-[11px]">
                      {prediction.model_source || 'RandomForest Model'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-3 border border-slate-200 bg-slate-50 text-slate-500 text-center text-xs rounded-md">
              Storage health prediction offline. Connect ML service or run prediction.
            </div>
          )}
        </div>

        {/* Ambient & Device Status */}
        <div className="space-y-4">
          
          {/* Environment / Weather */}
          <div className="card">
            <div className="section-title">
              <span>OUTDOOR WEATHER PARAMETERS</span>
            </div>
            {weather ? (
              <table className="scada-table">
                <tbody>
                  <tr>
                    <td className="text-slate-500">Condition</td>
                    <td className="font-semibold text-slate-900 text-right capitalize">{weather.description || weather.condition || '—'}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500">Outdoor Temp</td>
                    <td className="text-slate-800 text-right">{formatNumber(weather.temperature)} °C</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500">Outdoor Humidity</td>
                    <td className="text-slate-800 text-right">{formatNumber(weather.humidity)} %</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500">Rain Probability</td>
                    <td className="text-slate-800 text-right">{formatNumber(weather.rain_probability)} %</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-500">Weather telemetry offline.</p>
            )}
          </div>

          {/* Device / Fan Actuator */}
          <div className="card">
            <div className="section-title">
              <span>HARDWARE ACTUATOR STATUS</span>
            </div>
            {device || sensor ? (
              <table className="scada-table">
                <tbody>
                  <tr>
                    <td className="text-slate-500">Sensor Node State</td>
                    <td className="text-right">
                      <Badge severity={device?.is_online !== false ? 'online' : 'offline'}>
                        {device?.is_online !== false ? '● ONLINE' : '○ OFFLINE'}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-slate-500">Ventilation Fan Actuator</td>
                    <td className="text-right">
                      <Badge severity={device?.fan_status ? 'healthy' : 'offline'}>
                        {device?.fan_status ? 'RUNNING' : 'STOPPED'}
                      </Badge>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-slate-500">Last Telemetry Packet</td>
                    <td className="text-slate-600 text-right text-[11px]">
                      {syncTime}
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-500">No hardware sensor node connected.</p>
            )}
          </div>

        </div>
      </div>




    </div>
  );
}
