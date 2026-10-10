import React, { useCallback, useState } from 'react';
import { Cpu, Power, Wifi, Clock } from 'lucide-react';
import { getDeviceStatus, controlFan, getFanHistory } from '../api/client';
import { useAsync, usePolling } from '../hooks/useAsync';
import PageHeader from '../components/PageHeader';
import { LoadingSpinner, ErrorMessage, EmptyState, Badge } from '../components/UI';
import { formatDateTime } from '../utils/helpers';

export default function Devices() {
  const devicesFn = useCallback(() => getDeviceStatus(), []);
  const { data: devices, loading, error, refetch } = usePolling(devicesFn, 15000);

  const fanHistFn = useCallback(() => getFanHistory(), []);
  const { data: fanHistory, loading: fhLoading, refetch: refetchFanHistory } = useAsync(fanHistFn);

  const [controlling, setControlling] = useState({});

  const handleFan = async (deviceId, status) => {
    setControlling((c) => ({ ...c, [deviceId]: true }));
    try {
      await controlFan(deviceId, status, 'manual control via dashboard');
      refetch();
      refetchFanHistory();
    } catch (e) {
      alert(e?.response?.data?.detail || 'Fan control failed');
    } finally {
      setControlling((c) => ({ ...c, [deviceId]: false }));
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Hardware Devices"
        subtitle="ESP32 telemetry nodes and hardware actuator controls"
        onRefresh={() => { refetch(); refetchFanHistory(); }}
        loading={loading}
      />

      {loading && !devices ? <LoadingSpinner text="Loading devices..." /> :
       error ? <ErrorMessage message={error} onRetry={refetch} /> :
       !devices?.length ? (
        <EmptyState
          icon="📡"
          title="No devices registered"
          subtitle="Devices appear automatically when the ESP32 node transmits its first sensor reading."
        />
       ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {devices.map((d) => (
            <div key={d.device_id} className="card-lg animate-slide-up flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-700">
                      <Cpu size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">{d.name || d.device_id}</p>
                      <p className="text-[10px] text-slate-500 tracking-wider uppercase mt-0.5 font-medium">{d.device_id}</p>
                    </div>
                  </div>
                  <Badge severity={d.is_online ? 'online' : 'offline'}>
                    {d.is_online ? '● Online' : '○ Offline'}
                  </Badge>
                </div>

                <dl className="space-y-2 text-xs mb-4 border-b border-slate-100 pb-3">
                  {d.location && (
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">Location</span>
                      <span className="text-slate-900 font-semibold">{d.location}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">Last Connection</span>
                    <span className="text-slate-800 font-medium">{formatDateTime(d.last_seen)}</span>
                  </div>
                  {d.wifi_signal != null && (
                    <div className="flex justify-between">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide flex items-center gap-1"><Wifi size={11} />WiFi Signal</span>
                      <span className="text-slate-800 font-medium">{d.wifi_signal} dBm</span>
                    </div>
                  )}
                </dl>
              </div>

              {/* Fan Control */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Power size={14} className={d.fan_status ? 'text-emerald-700' : 'text-slate-400'} />
                  <span className="text-xs text-slate-800 font-semibold uppercase tracking-wider">Ventilation Fan</span>
                  <Badge severity={d.fan_status ? 'healthy' : 'offline'}>
                    {d.fan_status ? 'RUNNING' : 'STOPPED'}
                  </Badge>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleFan(d.device_id, true)}
                    disabled={d.fan_status || controlling[d.device_id]}
                    className="btn-primary btn-sm px-3"
                  >
                    ON
                  </button>
                  <button
                    onClick={() => handleFan(d.device_id, false)}
                    disabled={!d.fan_status || controlling[d.device_id]}
                    className="btn-secondary btn-sm px-3"
                  >
                    OFF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
       )}

      {/* Fan Log */}
      <div className="card-lg">
        <div className="section-title"><Clock size={14} className="text-slate-700" />Fan Activity Log</div>
        {fhLoading && !fanHistory ? <LoadingSpinner text="Loading log..." /> :
         !fanHistory?.length ? (
          <p className="text-slate-500 text-xs">No fan activity recorded.</p>
         ) : (
          <div className="overflow-auto">
            <table className="scada-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Device Node</th>
                  <th>Status</th>
                  <th>Trigger Mode</th>
                  <th>Actuation Reason</th>
                </tr>
              </thead>
              <tbody>
                {fanHistory.slice(0, 15).map((l) => (
                  <tr key={l.id}>
                    <td className="font-medium text-slate-700">{formatDateTime(l.created_at)}</td>
                    <td className="text-slate-900 font-bold">{l.device_id}</td>
                    <td>
                      <Badge severity={l.status ? 'healthy' : 'offline'}>{l.status ? 'ON' : 'OFF'}</Badge>
                    </td>
                    <td className="text-slate-600 uppercase font-semibold">{l.triggered_by || '—'}</td>
                    <td className="text-slate-600">{l.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
         )}
      </div>
    </div>
  );
}
