import { useState, useEffect, useRef } from 'react';
import { Thermometer, Droplets, Wind, Calendar, RefreshCw, Wifi } from 'lucide-react';
import StatCard from '../../components/StatCard';
import TrendChart from '../../components/TrendChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import { mockSensors, mockTrends } from '../../utils/mockData';

export default function LiveMonitoring() {
  const [data, setData] = useState(mockSensors);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const intervalRef = useRef(null);

  const refresh = () => {
    setData(prev => ({
      ...prev,
      temperature: +(Math.min(32, Math.max(18, prev.temperature + (Math.random() - 0.5) * 0.6))).toFixed(1),
      humidity:    +(Math.min(80, Math.max(50, prev.humidity    + (Math.random() - 0.5) * 0.8))).toFixed(1),
      gasLevel:    +(Math.min(500,Math.max(200,prev.gasLevel    + (Math.random() - 0.5) * 10))).toFixed(0),
      lastUpdated: new Date().toISOString(),
    }));
    setLastRefresh(new Date());
  };

  useEffect(() => {
    if (autoRefresh) intervalRef.current = setInterval(refresh, 5000);
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh]);

  const sensors = [
    { title: 'Temperature', value: data.temperature, unit: '°C',  min: data.tempMin, max: data.tempMax, avg: data.tempAvg, icon: Thermometer, color: 'orange', status: data.temperature > 28 ? 'Critical' : data.temperature > 26 ? 'High' : 'Normal' },
    { title: 'Humidity',    value: data.humidity,    unit: '%',   min: data.humMin,  max: data.humMax,  avg: data.humAvg,  icon: Droplets,    color: 'cyan',   status: data.humidity > 72 ? 'High' : 'Normal' },
    { title: 'Gas Level',   value: data.gasLevel,    unit: 'ppm', min: data.gasMin,  max: data.gasMax,  avg: data.gasAvg,  icon: Wind,        color: 'purple', status: data.gasLevel > 400 ? 'Danger' : data.gasLevel > 300 ? 'Moderate' : 'Safe' },
    { title: 'Storage Days',value: data.storageDays, unit: 'days',min: 0,            max: 30,           avg: 15,           icon: Calendar,    color: 'teal',   status: 'Normal' },
  ];

  const statusColor = { Normal: '#16a34a', High: '#d97706', Critical: '#dc2626', Safe: '#16a34a', Moderate: '#d97706', Danger: '#dc2626' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Live Monitoring</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>
            Last refresh: {lastRefresh.toLocaleTimeString()} · {autoRefresh ? 'Auto-refresh every 5s' : 'Auto-refresh paused'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setAutoRefresh(!autoRefresh)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8,
            border: '1px solid #e5e7eb', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: autoRefresh ? '#f0fdf4' : '#fff',
            color: autoRefresh ? '#16a34a' : '#374151',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: autoRefresh ? '#16a34a' : '#9ca3af' }} />
            {autoRefresh ? 'Auto ON' : 'Auto OFF'}
          </button>
          <button onClick={refresh} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
            <RefreshCw size={13} /> Refresh Now
          </button>
        </div>
      </div>

      {/* Sensor detail cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {sensors.map(({ title, value, unit, min, max, avg, icon: Icon, color, status }) => (
          <div key={title} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
            <StatCard title={title} value={value} unit={unit} icon={Icon} color={color} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
              {[['Min', min, unit], ['Max', max, unit], ['Avg', avg, unit]].map(([l, v, u]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>{l}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{v}{u}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Status</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${statusColor[status]}18`, color: statusColor[status] }}>{status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sensor connection status */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 14 }}>Sensor Connection Status</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { name: 'DHT22 (Temp/Humidity)', status: 'online',  lastRead: 'Just now' },
            { name: 'MQ135 (Gas Sensor)',    status: 'online',  lastRead: 'Just now' },
            { name: 'ESP32 Controller',      status: 'online',  lastRead: 'Just now' },
          ].map(({ name, status, lastRead }) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
              <Wifi size={15} color="#16a34a" />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{name}</p>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>Last read: {lastRead}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <TrendChart data={mockTrends} title="Temperature Trend (Live)" lines={[{ key: 'temperature', label: 'Temp °C' }]} />
        <TrendChart data={mockTrends} title="Humidity Trend (Live)"    lines={[{ key: 'humidity',    label: 'Humidity %' }]} />
        <TrendChart data={mockTrends} title="Gas Level Trend (Live)"   lines={[{ key: 'gas',         label: 'Gas ppm' }]} />
        <TrendChart data={mockTrends} title="Health Score Trend"       lines={[{ key: 'healthScore', label: 'Health Score' }]} />
      </div>
    </div>
  );
}
