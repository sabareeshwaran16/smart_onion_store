import { useState } from 'react';
import { Brain, Clock, Lightbulb, TrendingDown, TrendingUp, CloudRain, Target, AlertTriangle, CheckCircle, Wind, Droplets, Search, Thermometer } from 'lucide-react';
import RiskGauge from '../../components/RiskGauge';
import { Card, SectionTitle } from '../../components/ui';
import { useFetch } from '../../hooks/useFetch';
import { predictionsApi } from '../../api';
import { mockPredictions, mockSensors, mockWeather } from '../../utils/mockData';
import { generateExplanation, getShelfLifeZone, calcWeightLossFactors } from '../../services/storageEngine';

const priorityStyle = {
  High:   { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  Medium: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Low:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Info:   { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
};
const iconMap = { wind: Wind, droplets: Droplets, search: Search, check: CheckCircle, alert: AlertTriangle };

export default function Predictions() {
  const { data, loading, refetch } = useFetch(predictionsApi.get, mockPredictions);
  const p = data || mockPredictions;
  const s = mockSensors;
  const w = mockWeather;
  const [activeTab, setActiveTab] = useState('overview');

  const zone = getShelfLifeZone(p.shelfLifeRemaining);
  const explanationFactors = generateExplanation(s, p.weatherImpact);
  const weightFactors = calcWeightLossFactors(s.temperature, s.humidity, s.storageDays, w.current.humidity);

  const tabs = [
    { id: 'overview',    label: 'Overview' },
    { id: 'explanation', label: 'AI Explanation' },
    { id: 'weather',     label: 'Weather Impact' },
    { id: 'history',     label: 'Prediction History' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>AI Predictions</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>
            Last updated: {new Date(p.lastPrediction).toLocaleTimeString()} ·
            Accuracy: <span style={{ color: '#16a34a', fontWeight: 600 }}>{p.predictionAccuracy}%</span> ·
            Error range: <span style={{ color: '#6b7280', fontWeight: 500 }}>{p.errorRange}</span>
          </p>
        </div>
        {/* Confidence badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Confidence</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#2563eb', lineHeight: 1.1 }}>{p.confidence}%</p>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={22} color="#2563eb" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            background: activeTab === t.id ? '#fff' : 'transparent',
            color: activeTab === t.id ? '#111827' : '#6b7280',
            boxShadow: activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <>
          {/* Shelf Life Hero */}
          <div style={{ background: zone.bg, border: `1px solid ${zone.border}`, borderRadius: 14, padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  <Clock size={24} color={zone.color} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: zone.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Shelf Life Remaining</p>
                  <p style={{ fontSize: 38, fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
                    {p.shelfLifeRemaining} <span style={{ fontSize: 18, fontWeight: 400, color: '#6b7280' }}>days</span>
                  </p>
                </div>
              </div>
              <div style={{ padding: '8px 18px', borderRadius: 99, background: '#fff', border: `1.5px solid ${zone.border}`, fontSize: 13, fontWeight: 700, color: zone.color }}>
                {zone.zone} Zone — {zone.message}
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: '#6b7280' }}>Day {s.storageDays}</span>
                <span style={{ fontSize: 11, color: '#6b7280' }}>Day 90 (max)</span>
              </div>
              <div style={{ height: 10, borderRadius: 99, background: '#e5e7eb', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(p.shelfLifeRemaining / 90) * 100}%`, borderRadius: 99, background: zone.color, transition: 'width 0.6s ease' }} />
              </div>
              {/* Zone markers */}
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                {[{ label: 'Safe ≥30d', color: '#16a34a', bg: '#f0fdf4' }, { label: 'Monitor 15–30d', color: '#d97706', bg: '#fffbeb' }, { label: 'Warning 7–15d', color: '#ea580c', bg: '#fff7ed' }, { label: 'Critical <7d', color: '#dc2626', bg: '#fef2f2' }].map(z => (
                  <span key={z.label} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: z.bg, color: z.color }}>{z.label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Gauges */}
          <div>
            <SectionTitle>Risk Assessment</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <RiskGauge label="Rotting Risk"   value={p.rottingRisk}   color="red"    />
              <RiskGauge label="Sprouting Risk" value={p.sproutingRisk} color="yellow" />
              <RiskGauge label="Spoilage Risk"  value={p.spoilageRisk}  color="orange" />
            </div>
          </div>

          {/* Weight Loss Factors */}
          <div>
            <SectionTitle>Weight Loss Factor Breakdown</SectionTitle>
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {weightFactors.map(f => (
                  <div key={f.factor}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{f.factor}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: f.color }}>{f.pct}%</span>
                    </div>
                    <div style={{ height: 7, borderRadius: 99, background: '#f3f4f6', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${f.pct}%`, borderRadius: 99, background: f.color, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          <div>
            <SectionTitle>AI Recommendations</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {p.recommendations.map(r => {
                const s2 = priorityStyle[r.priority] || priorityStyle.Info;
                const Icon = iconMap[r.icon] || CheckCircle;
                return (
                  <div key={r.id} style={{ display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 12, background: s2.bg, border: `1px solid ${s2.border}` }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: '#fff', border: `1px solid ${s2.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={s2.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{r.title}</p>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#fff', color: s2.color, border: `1px solid ${s2.border}` }}>{r.priority}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{r.reason}</p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: s2.color }}>→ {r.action}</p>
                      {r.improvement && <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Expected: {r.improvement}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── AI EXPLANATION TAB ── */}
      {activeTab === 'explanation' && (
        <>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={18} color="#2563eb" />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Why this prediction?</p>
                <p style={{ fontSize: 12, color: '#9ca3af' }}>Factor-by-factor breakdown of the AI model output</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {explanationFactors.map((factor, i) => {
                const isNeg = factor.includes('exceeds') || factor.includes('above') || factor.includes('elevated') || factor.includes('cumulative');
                return (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10, background: isNeg ? '#fff7ed' : '#f0fdf4', border: `1px solid ${isNeg ? '#fed7aa' : '#bbf7d0'}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isNeg ? <AlertTriangle size={14} color="#ea580c" /> : <CheckCircle size={14} color="#16a34a" />}
                    </div>
                    <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{factor}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Explanation factors from mockData */}
          <div>
            <SectionTitle>Sensor Factor Analysis</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {p.explanationFactors?.map((f, i) => {
                const impactColor = f.impact === 'positive' ? '#16a34a' : f.impact === 'negative' ? '#dc2626' : '#d97706';
                const impactBg    = f.impact === 'positive' ? '#f0fdf4' : f.impact === 'negative' ? '#fef2f2' : '#fffbeb';
                return (
                  <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: '#fff', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{f.factor}</p>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: impactBg, color: impactColor }}>
                        {f.impact === 'positive' ? '▲ Good' : f.impact === 'negative' ? '▼ Risk' : '● Neutral'}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>{f.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── WEATHER IMPACT TAB ── */}
      {activeTab === 'weather' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            {[
              { label: 'Outdoor Humidity', value: `${w.current.humidity}%`, icon: Droplets, color: '#0891b2', bg: '#ecfeff', note: 'Current outdoor' },
              { label: 'Outdoor Temp', value: `${w.current.temp}°C`, icon: Thermometer, color: '#ea580c', bg: '#fff7ed', note: 'Current outdoor' },
              { label: 'Indoor Temp', value: `${s.temperature}°C`, icon: Thermometer, color: '#16a34a', bg: '#f0fdf4', note: 'Current indoor' },
            ].map(item => (
              <Card key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={20} color={item.color} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>{item.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>{item.value}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>{item.note}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloudRain size={18} color="#2563eb" />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Weather → Storage Impact Chain</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { step: '1', label: 'Outdoor Condition', value: `Humidity ${w.current.humidity}% · Temp ${w.current.temp}°C · ${w.current.condition}`, color: '#2563eb', bg: '#eff6ff' },
                { step: '↓', label: '', value: '', color: '#d1d5db', bg: 'transparent' },
                { step: '2', label: 'Expected Indoor Effect', value: p.weatherImpact?.indoorEffect || 'Humidity rise of 4–6% expected over 48 hours', color: '#d97706', bg: '#fffbeb' },
                { step: '↓', label: '', value: '', color: '#d1d5db', bg: 'transparent' },
                { step: '3', label: 'Prediction Impact', value: p.weatherImpact?.shelfLifeImpact || '-5 days shelf life if ventilation not improved', color: '#dc2626', bg: '#fef2f2' },
                { step: '↓', label: '', value: '', color: '#d1d5db', bg: 'transparent' },
                { step: '4', label: 'Recommended Action', value: p.weatherImpact?.recommendation || 'Close warehouse vents between 11 AM – 4 PM', color: '#16a34a', bg: '#f0fdf4' },
              ].map((item, i) => item.label ? (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 14px', borderRadius: 10, background: item.bg, border: `1px solid ${item.bg === 'transparent' ? 'transparent' : '#e5e7eb'}`, marginBottom: 4 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: '#fff', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: item.color }}>{item.step}</div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: item.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{item.label}</p>
                    <p style={{ fontSize: 13, color: '#374151' }}>{item.value}</p>
                  </div>
                </div>
              ) : (
                <div key={i} style={{ textAlign: 'center', fontSize: 18, color: '#d1d5db', lineHeight: 1, marginBottom: 4 }}>↓</div>
              ))}
            </div>
          </Card>

          {/* 5-day forecast impact */}
          <div>
            <SectionTitle>5-Day Forecast Storage Impact</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              {w.forecast.map((day, i) => {
                const riskColor = day.humidity > 85 ? '#dc2626' : day.humidity > 75 ? '#d97706' : '#16a34a';
                const riskBg    = day.humidity > 85 ? '#fef2f2' : day.humidity > 75 ? '#fffbeb' : '#f0fdf4';
                return (
                  <div key={i} style={{ padding: '14px', borderRadius: 12, background: '#fff', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>{day.day}</p>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{day.icon}</div>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{day.high}° / {day.low}°</p>
                    <div style={{ padding: '3px 8px', borderRadius: 99, background: riskBg, fontSize: 11, fontWeight: 600, color: riskColor }}>
                      💧 {day.humidity}%
                    </div>
                    <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>Rain {day.rain}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── PREDICTION HISTORY TAB ── */}
      {activeTab === 'history' && (
        <>
          <Card>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Prediction Comparison — Last 10 Days</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                    {['Date', 'Shelf Life', 'Rot Risk', 'Spoilage', 'Weight (kg)', 'Confidence'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {p.history?.map((row, i) => {
                    const prev = p.history[i + 1];
                    const slDiff = prev ? row.shelfLife - prev.shelfLife : 0;
                    return (
                      <tr key={row.id} style={{ borderBottom: '1px solid #f9fafb', background: i === 0 ? '#f0fdf4' : 'transparent' }}>
                        <td style={{ padding: '10px 12px', color: '#374151', fontWeight: i === 0 ? 700 : 400 }}>
                          {row.date} {i === 0 && <span style={{ fontSize: 10, background: '#dcfce7', color: '#16a34a', padding: '1px 6px', borderRadius: 99, marginLeft: 4 }}>Today</span>}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ fontWeight: 600, color: '#111827' }}>{row.shelfLife}d</span>
                          {prev && <span style={{ fontSize: 11, marginLeft: 6, color: slDiff >= 0 ? '#16a34a' : '#dc2626' }}>{slDiff >= 0 ? '▲' : '▼'}{Math.abs(slDiff)}</span>}
                        </td>
                        <td style={{ padding: '10px 12px', color: row.rottingRisk > 20 ? '#dc2626' : '#374151' }}>{row.rottingRisk}%</td>
                        <td style={{ padding: '10px 12px', color: row.spoilageRisk > 20 ? '#ea580c' : '#374151' }}>{row.spoilageRisk}%</td>
                        <td style={{ padding: '10px 12px', color: '#374151' }}>{row.weight ?? '—'}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ flex: 1, height: 5, borderRadius: 99, background: '#f3f4f6', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${row.confidence}%`, background: '#2563eb', borderRadius: 99 }} />
                            </div>
                            <span style={{ fontSize: 12, color: '#374151', fontWeight: 600, minWidth: 32 }}>{row.confidence}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

    </div>
  );
}
