import { useState } from 'react';
import { Save, User, Bell, Sliders, Moon, Sun, Key, Globe, ExternalLink } from 'lucide-react';
import { mockSettings } from '../../utils/mockData';
import toast from 'react-hot-toast';

const card = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px' };
const inputSt = {
  width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb',
  borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#111827', outline: 'none',
};

function SectionHeader({ icon: Icon, color, bg, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color={color} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{label}</p>
    </div>
  );
}

export default function Settings() {
  const [s, setS] = useState(mockSettings);
  const [theme, setTheme] = useState('light');

  const [owmKey, setOwmKey] = useState(localStorage.getItem('owm_api_key') || '');
  const [weatherCity, setWeatherCity] = useState(localStorage.getItem('weather_city') || 'Coimbatore,IN');

  const set  = (k, v) => setS(p => ({ ...p, [k]: v }));
  const setN = (k, v) => setS(p => ({ ...p, notifications: { ...p.notifications, [k]: v } }));
  const setU = (k, v) => setS(p => ({ ...p, user: { ...p.user, [k]: v } }));

  const saveAll = () => {
    localStorage.setItem('owm_api_key', owmKey.trim());
    localStorage.setItem('weather_city', weatherCity.trim());
    toast.success('Settings saved!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 680 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Settings</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>Configure system preferences</p>
        </div>
        <button onClick={saveAll} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '9px 18px', borderRadius: 8, border: 'none',
          background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>
          <Save size={14} /> Save Changes
        </button>
      </div>

      {/* Thresholds */}
      <div style={card}>
        <SectionHeader icon={Sliders} color="#2563eb" bg="#eff6ff" label="Sensor Thresholds" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { label: 'Min Temperature (°C)', key: 'temperatureMin' },
            { label: 'Max Temperature (°C)', key: 'temperatureMax' },
            { label: 'Min Humidity (%)',      key: 'humidityMin'    },
            { label: 'Max Humidity (%)',      key: 'humidityMax'    },
            { label: 'Max Gas Level (ppm)',   key: 'gasMax'         },
          ].map(({ label, key }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>{label}</label>
              <input type="number" value={s[key]} onChange={e => set(key, +e.target.value)}
                style={inputSt}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div style={card}>
        <SectionHeader icon={Bell} color="#ea580c" bg="#fff7ed" label="Notifications" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Email Notifications', sub: 'Receive alerts via email',  key: 'email' },
            { label: 'SMS Notifications',   sub: 'Receive alerts via SMS',    key: 'sms'   },
            { label: 'Push Notifications',  sub: 'Browser push alerts',       key: 'push'  },
          ].map(({ label, sub, key }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</p>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{sub}</p>
              </div>
              <button onClick={() => setN(key, !s.notifications[key])} style={{
                width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
                background: s.notifications[key] ? '#2563eb' : '#e5e7eb',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}>
                <span style={{
                  position: 'absolute', top: 2, left: 2,
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s',
                  transform: s.notifications[key] ? 'translateX(20px)' : 'translateX(0)',
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div style={card}>
        <SectionHeader icon={Sun} color="#ca8a04" bg="#fefce8" label="Appearance" />
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ t: 'light', Icon: Sun, label: 'Light' }, { t: 'dark', Icon: Moon, label: 'Dark' }].map(({ t, Icon, label }) => (
            <button key={t} onClick={() => setTheme(t)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 20px', borderRadius: 8, cursor: 'pointer',
              background: theme === t ? '#eff6ff' : '#f9fafb',
              border: `1px solid ${theme === t ? '#bfdbfe' : '#e5e7eb'}`,
              color: theme === t ? '#2563eb' : '#6b7280',
              fontSize: 13, fontWeight: theme === t ? 600 : 400,
              transition: 'all 0.15s',
            }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* API Settings */}
      <div style={card}>
        <SectionHeader icon={Key} color="#0891b2" bg="#ecfeff" label="API Settings" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>
              OpenWeatherMap API Key
              <a href="https://openweathermap.org/api" target="_blank" rel="noreferrer"
                style={{ marginLeft: 8, fontSize: 11, color: '#2563eb', textDecoration: 'none' }}>
                Get free key ↗
              </a>
            </label>
            <input
              type="text"
              value={owmKey}
              onChange={e => setOwmKey(e.target.value)}
              placeholder="e.g. a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4"
              style={inputSt}
              onFocus={e => e.target.style.borderColor = '#0891b2'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Free tier: 1,000 calls/day. Used for Weather page.</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>Default Weather City</label>
            <input
              type="text"
              value={weatherCity}
              onChange={e => setWeatherCity(e.target.value)}
              placeholder="e.g. Coimbatore,IN"
              style={inputSt}
              onFocus={e => e.target.style.borderColor = '#0891b2'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Format: CityName,CountryCode (e.g. Chennai,IN)</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>FastAPI Backend URL</label>
            <input
              type="text"
              value={s.fastapiUrl}
              onChange={e => set('fastapiUrl', e.target.value)}
              placeholder="http://localhost:8000"
              style={inputSt}
              onFocus={e => e.target.style.borderColor = '#0891b2'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div style={card}>
        <SectionHeader icon={User} color="#7c3aed" bg="#faf5ff" label="User Profile" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Full Name', key: 'name',  type: 'text'  },
            { label: 'Email',     key: 'email', type: 'email' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 6 }}>{label}</label>
              <input type={type} value={s.user[key]} onChange={e => setU(key, e.target.value)}
                style={inputSt}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
