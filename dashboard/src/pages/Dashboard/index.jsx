import { useState, useEffect } from 'react';
import onionImg from '../../assets/hero.png';
import { Thermometer, Droplets, Wind, Calendar, Heart, Clock, Fan, RefreshCw } from 'lucide-react';
import StatCard from '../../components/StatCard';
import RiskGauge from '../../components/RiskGauge';
import AlertPanel from '../../components/AlertPanel';
import ActivityPanel from '../../components/ActivityPanel';
import TrendChart from '../../components/TrendChart';
import HealthGauge from '../../components/HealthGauge';
import RecommendationPanel from '../../components/RecommendationPanel';
import AutomationPanel from '../../components/AutomationPanel';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SectionTitle, Card, SkeletonCard } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { sensorsApi } from '../../api';
import { mockSensors, mockAlerts, mockActivity, mockTrends, mockPredictions } from '../../utils/mockData';

export default function Dashboard() {
  const { data, loading, refetch } = useFetch(sensorsApi.get, mockSensors);
  const s = data || mockSensors;
  const p = mockPredictions;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={onionImg} alt="onion" style={{ width: 48, height: 48, objectFit: 'contain' }} />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>OnionStorage</h1>
            <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>
              Smart Onion Storage — Live Overview · Updated {new Date(s.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <button onClick={refetch} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Health + Sensor Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
        <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Storage Health</p>
          <HealthGauge score={s.healthScore} />
          <p style={{ fontSize: 11, color: '#9ca3af' }}>Updated {new Date(s.lastUpdated).toLocaleTimeString()}</p>
        </Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : <>
            <StatCard title="Temperature"  value={s.temperature}  unit="°C"   icon={Thermometer} color="orange" trend={1.2} />
            <StatCard title="Humidity"     value={s.humidity}     unit="%"    icon={Droplets}    color="cyan"   trend={-0.8} />
            <StatCard title="Gas Level"    value={s.gasLevel}     unit="ppm"  icon={Wind}        color="purple" />
            <StatCard title="Storage Days" value={s.storageDays}  unit="days" icon={Calendar}    color="teal"   />
          </>}
        </div>
      </div>

      {/* AI Predictions row */}
      <div>
        <SectionTitle>AI Predictions</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          <StatCard title="Shelf Life Left" value={s.remainingDays || 16} unit="days" icon={Clock} color="green" />
          <StatCard title="Fan Status"      value={s.fanStatus}           icon={Fan}  color={s.fanStatus === 'ON' ? 'green' : 'orange'} badge={s.fanStatus} />
          <RiskGauge label="Rotting Risk"   value={p.rottingRisk}   color="red"    />
          <RiskGauge label="Sprouting Risk" value={p.sproutingRisk} color="yellow" />
          <RiskGauge label="Spoilage Risk"  value={p.spoilageRisk}  color="orange" />
        </div>
      </div>

      {/* Charts */}
      <div>
        <SectionTitle>Trends (24h)</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <TrendChart data={mockTrends} title="Temperature & Humidity"
            lines={[{ key: 'temperature', label: 'Temp °C' }, { key: 'humidity', label: 'Humidity %' }]} />
          <TrendChart data={mockTrends} title="Gas Level & Health Score"
            lines={[{ key: 'gas', label: 'Gas ppm' }, { key: 'healthScore', label: 'Health Score' }]} />
        </div>
      </div>

      {/* Bottom panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <AlertPanel alerts={mockAlerts.filter(a => a.status === 'active')} />
        <AutomationPanel sensors={s} />
        <ActivityPanel activities={mockActivity} />
      </div>

      {/* Recommendations */}
      <RecommendationPanel recommendations={p.recommendations} />
    </div>
  );
}
