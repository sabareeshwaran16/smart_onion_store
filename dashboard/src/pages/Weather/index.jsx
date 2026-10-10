import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Wind, Droplets, Eye, Gauge, Sunrise, Sunset,
  RefreshCw, AlertTriangle, CheckCircle, Info, Key, ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  fetchCurrentWeather, fetchForecast, fetchAirQuality, getStorageRecommendation,
} from '../../services/weatherService';
import { mockWeather } from '../../utils/mockData';
import { Card, SectionTitle } from '../../components/ui';

// ── Tooltip ──────────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
      <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ fontSize: 12, color: '#6b7280' }}>{p.name}:</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Recommendation banner ────────────────────────────────────────────────────
const levelStyle = {
  critical: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', Icon: AlertTriangle },
  warning:  { bg: '#fffbeb', border: '#fde68a', color: '#d97706', Icon: AlertTriangle },
  info:     { bg: '#eff6ff', border: '#bfdbfe', color: '#2563eb', Icon: Info          },
  success:  { bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a', Icon: CheckCircle   },
};

function RecBanner({ tips }) {
  if (!tips?.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {tips.map((t, i) => {
        const s = levelStyle[t.level] || levelStyle.info;
        return (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '12px 16px', borderRadius: 10, background: s.bg, border: `1px solid ${s.border}` }}>
            <s.Icon size={16} color={s.color} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: '#374151' }}>{t.text}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── No API key notice ────────────────────────────────────────────────────────
function NoKeyBanner({ usingMock }) {
  return (
    <div style={{ padding: '14px 18px', borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <Key size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>
          {usingMock ? 'Showing mock weather data' : 'OpenWeatherMap API key required'}
        </p>
        <p style={{ fontSize: 13, color: '#78350f', marginBottom: 8 }}>
          Get a free API key at{' '}
          <a href="https://openweathermap.org/api" target="_blank" rel="noreferrer"
            style={{ color: '#2563eb', fontWeight: 600 }}>
            openweathermap.org/api <ExternalLink size={11} style={{ display: 'inline' }} />
          </a>
          , then save it in{' '}
          <Link to="/settings" style={{ color: '#2563eb', fontWeight: 600 }}>Settings → API Settings</Link>.
        </p>
        <p style={{ fontSize: 12, color: '#92400e' }}>
          Free tier: 1,000 calls/day · Current weather + 5-day forecast included.
        </p>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function Weather() {
  const [current,  setCurrent]  = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly,   setHourly]   = useState([]);
  const [aqi,      setAqi]      = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [usingMock,setUsingMock]= useState(false);
  const [city,     setCity]     = useState(
    localStorage.getItem('weather_city') || 'Coimbatore,IN'
  );
  const [cityInput, setCityInput] = useState(city);

  const indoorTemp = 24.5;
  const indoorHum  = 68;

  const load = useCallback(async (targetCity = city) => {
    setLoading(true);
    setError(null);
    setUsingMock(false);
    try {
      const [cur, fc] = await Promise.all([
        fetchCurrentWeather(targetCity),
        fetchForecast(targetCity),
      ]);
      setCurrent(cur);
      setForecast(fc.forecast);
      setHourly(fc.hourly);
      // AQI (non-blocking)
      fetchAirQuality(cur.lat, cur.lon).then(setAqi).catch(() => {});
    } catch (err) {
      if (err.message === 'NO_KEY') {
        // Fall back to mock silently
        const m = mockWeather;
        setCurrent({ ...m.current, location: m.location, lat: null, lon: null });
        setForecast(m.forecast);
        setHourly(m.hourly);
        setUsingMock(true);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch weather');
        // Still show mock on error
        const m = mockWeather;
        setCurrent({ ...m.current, location: m.location, lat: null, lon: null });
        setForecast(m.forecast);
        setHourly(m.hourly);
        setUsingMock(true);
      }
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => { load(); }, [load]);

  const handleCitySearch = (e) => {
    e.preventDefault();
    const trimmed = cityInput.trim();
    if (!trimmed) return;
    setCity(trimmed);
    localStorage.setItem('weather_city', trimmed);
    load(trimmed);
  };

  const tips = current ? getStorageRecommendation(current, indoorTemp, indoorHum) : null;

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 14 }}>
      <div style={{ position: 'relative', width: 40, height: 40 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', animation: 'spin 1s linear infinite' }} />
      </div>
      <p style={{ fontSize: 13, color: '#9ca3af' }}>Fetching weather data…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Weather</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>
            Outdoor conditions affecting onion storage
            {usingMock && <span style={{ marginLeft: 8, fontSize: 11, color: '#d97706', fontWeight: 600 }}>(Mock Data)</span>}
          </p>
        </div>
        {/* City search */}
        <form onSubmit={handleCitySearch} style={{ display: 'flex', gap: 8 }}>
          <input
            value={cityInput}
            onChange={e => setCityInput(e.target.value)}
            placeholder="City, Country (e.g. Chennai,IN)"
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, color: '#374151', outline: 'none', width: 220, background: '#f9fafb' }}
            onFocus={e => e.target.style.borderColor = '#2563eb'}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
          <button type="submit" style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Search
          </button>
          <button type="button" onClick={() => load(city)} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <RefreshCw size={14} color="#6b7280" />
          </button>
        </form>
      </div>

      {/* API key notice */}
      {usingMock && <NoKeyBanner usingMock={usingMock} />}

      {/* Error notice (non-blocking) */}
      {error && !usingMock && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 13, color: '#dc2626' }}>
          ⚠️ {error} — showing cached data.
        </div>
      )}

      {current && (
        <>
          {/* ── Current weather hero ── */}
          <div style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', borderRadius: 16, padding: '28px 32px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              {/* Left */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <MapPin size={14} color="#93c5fd" />
                  <span style={{ fontSize: 13, color: '#93c5fd' }}>{current.location}</span>
                </div>
                {/* Use OWM icon image if available, else emoji */}
                {current.iconUrl
                  ? <img src={current.iconUrl} alt={current.condition} style={{ width: 80, height: 80 }} />
                  : <div style={{ fontSize: 64, lineHeight: 1 }}>{current.icon}</div>
                }
                <p style={{ fontSize: 52, fontWeight: 800, marginTop: 4, lineHeight: 1 }}>{current.temp}°C</p>
                <p style={{ fontSize: 15, color: '#bfdbfe', marginTop: 6 }}>{current.description}</p>
                <p style={{ fontSize: 13, color: '#93c5fd', marginTop: 4 }}>Feels like {current.feelsLike}°C · Clouds {current.clouds}%</p>
              </div>

              {/* Right: stat grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { Icon: Droplets, label: 'Humidity',    value: `${current.humidity}%`      },
                  { Icon: Gauge,    label: 'Pressure',    value: `${current.pressure} hPa`   },
                  { Icon: Wind,     label: 'Wind',        value: `${current.windSpeed} km/h ${current.windDir}` },
                  { Icon: Eye,      label: 'Visibility',  value: `${current.visibility} km`  },
                ].map(({ Icon, label, value }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '12px 16px', minWidth: 130 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Icon size={13} color="#93c5fd" />
                      <span style={{ fontSize: 11, color: '#93c5fd' }}>{label}</span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sunrise / Sunset / AQI */}
            <div style={{ display: 'flex', gap: 24, marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.15)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sunrise size={14} color="#fde68a" />
                <span style={{ fontSize: 12, color: '#bfdbfe' }}>Sunrise {current.sunrise}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sunset size={14} color="#fca5a5" />
                <span style={{ fontSize: 12, color: '#bfdbfe' }}>Sunset {current.sunset}</span>
              </div>
              {aqi && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#bfdbfe' }}>
                    AQI: <span style={{ fontWeight: 700, color: aqi.color }}>{aqi.label}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Indoor vs Outdoor comparison ── */}
          <Card>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 14 }}>Indoor vs Outdoor Comparison</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Temperature', indoor: indoorTemp, outdoor: current.temp,     unit: '°C' },
                { label: 'Humidity',    indoor: indoorHum,  outdoor: current.humidity, unit: '%'  },
              ].map(({ label, indoor, outdoor, unit }) => {
                const diff = (outdoor - indoor).toFixed(1);
                return (
                  <div key={label} style={{ padding: '14px 16px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 10 }}>{label}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 22, fontWeight: 700, color: '#2563eb' }}>{indoor}{unit}</p>
                        <p style={{ fontSize: 11, color: '#9ca3af' }}>Indoor</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: +diff > 0 ? '#dc2626' : '#16a34a' }}>
                          {+diff > 0 ? '+' : ''}{diff}{unit}
                        </p>
                        <p style={{ fontSize: 10, color: '#9ca3af' }}>Difference</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 22, fontWeight: 700, color: '#ea580c' }}>{outdoor}{unit}</p>
                        <p style={{ fontSize: 11, color: '#9ca3af' }}>Outdoor</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ── AQI components ── */}
          {aqi?.components && (
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 14 }}>
                Air Quality Index — <span style={{ color: aqi.color }}>{aqi.label}</span>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {[
                  { label: 'PM2.5', val: aqi.components.pm2_5,  unit: 'μg/m³' },
                  { label: 'PM10',  val: aqi.components.pm10,   unit: 'μg/m³' },
                  { label: 'CO',    val: aqi.components.co,     unit: 'μg/m³' },
                  { label: 'NO₂',   val: aqi.components.no2,    unit: 'μg/m³' },
                ].map(({ label, val, unit }) => (
                  <div key={label} style={{ padding: '12px 14px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{label}</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{val?.toFixed(1)}</p>
                    <p style={{ fontSize: 10, color: '#9ca3af' }}>{unit}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Storage recommendations ── */}
          {tips && (
            <div>
              <SectionTitle>Storage Recommendations Based on Weather</SectionTitle>
              <RecBanner tips={tips} />
            </div>
          )}

          {/* ── 5-day forecast ── */}
          {forecast.length > 0 && (
            <div>
              <SectionTitle>5-Day Forecast</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {forecast.map((f) => (
                  <Card key={f.day} style={{ textAlign: 'center' }} padding="16px 12px">
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>{f.day}</p>
                    {f.iconUrl
                      ? <img src={f.iconUrl} alt={f.condition} style={{ width: 48, height: 48, margin: '0 auto 4px' }} />
                      : <div style={{ fontSize: 32, marginBottom: 8 }}>{f.icon}</div>
                    }
                    <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>{f.condition}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ea580c' }}>{f.high}°</span>
                      <span style={{ fontSize: 13, color: '#9ca3af' }}>{f.low}°</span>
                    </div>
                    <p style={{ marginTop: 6, fontSize: 11, color: '#3b82f6' }}>💧 {f.rain}%</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ── Hourly chart ── */}
          {hourly.length > 0 && (
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Hourly Forecast (Next 36h)</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={hourly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ea580c" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="hGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0891b2" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0891b2" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af', paddingTop: 8 }} />
                  <Area type="monotone" dataKey="temp"     name="Temp °C"    stroke="#ea580c" fill="url(#tGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="humidity" name="Humidity %"  stroke="#0891b2" fill="url(#hGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* ── Rain probability chart ── */}
          {hourly.length > 0 && (
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 20 }}>Rain Probability & Wind Speed</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={hourly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af', paddingTop: 8 }} />
                  <Area type="monotone" dataKey="rain" name="Rain %" stroke="#3b82f6" fill="url(#rGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="wind" name="Wind km/h" stroke="#7c3aed" fill="none" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
