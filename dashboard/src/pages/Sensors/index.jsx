import { Thermometer, Droplets, Wind, RefreshCw } from 'lucide-react';
import StatCard from '../../components/StatCard';
import TrendChart from '../../components/TrendChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useFetch } from '../../hooks/useFetch';
import { sensorsApi } from '../../api';
import { mockSensors, mockTrends } from '../../utils/mockData';

const thresholds = [
  { label: 'Temperature', key: 'temperature', min: 18, max: 28, unit: '°C',  color: '#ea580c', track: '#ffedd5' },
  { label: 'Humidity',    key: 'humidity',    min: 55, max: 75, unit: '%',   color: '#0891b2', track: '#cffafe' },
  { label: 'Gas Level',   key: 'gasLevel',    min: 0,  max: 500, unit: 'ppm', color: '#7c3aed', track: '#ede9fe' },
];

export default function Sensors() {
  const { data, loading, refetch } = useFetch(sensorsApi.get, mockSensors);
  const s = data || mockSensors;
  if (loading) return <LoadingSpinner text="Fetching sensor data..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Sensor Monitoring</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>Real-time sensor readings</p>
        </div>
        <button onClick={refetch} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb',
          background: '#fff', fontSize: 13, fontWeight: 500, color: '#374151',
          cursor: 'pointer',
        }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <StatCard title="Temperature" value={s.temperature} unit="°C"  icon={Thermometer} color="orange" />
        <StatCard title="Humidity"    value={s.humidity}    unit="%"   icon={Droplets}    color="cyan"   />
        <StatCard title="Gas Level"   value={s.gasLevel}    unit="ppm" icon={Wind}        color="purple" />
      </div>

      {/* Threshold cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {thresholds.map(({ label, key, min, max, unit, color, track }) => {
          const val = s[key];
          const pct = Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100));
          const safe = pct < 70;
          return (
            <div key={key} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</p>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
                  background: safe ? '#f0fdf4' : '#fef2f2',
                  color: safe ? '#16a34a' : '#dc2626',
                }}>{safe ? 'Normal' : 'Warning'}</span>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 14 }}>
                {val}<span style={{ fontSize: 14, color: '#9ca3af', fontWeight: 400, marginLeft: 4 }}>{unit}</span>
              </p>
              <div style={{ height: 6, borderRadius: 99, background: track, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{
                  height: '100%', width: `${pct}%`, borderRadius: 99,
                  background: safe ? color : '#ef4444',
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#d1d5db' }}>
                <span>{min}{unit}</span><span>{max}{unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <TrendChart data={mockTrends} title="Temperature Trend" lines={[{ key: 'temperature', label: 'Temp °C' }]} />
        <TrendChart data={mockTrends} title="Humidity Trend"    lines={[{ key: 'humidity',    label: 'Humidity %' }]} />
      </div>
      <TrendChart data={mockTrends} title="Gas Level Trend" lines={[{ key: 'gas', label: 'Gas ppm' }]} />
    </div>
  );
}
