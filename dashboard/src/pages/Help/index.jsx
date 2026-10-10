import { HelpCircle, BookOpen, Cpu, Brain, MessageCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  { q: 'What sensors does the system use?', a: 'The system uses a DHT22 sensor for temperature and humidity, and an MQ135 sensor for gas/air quality monitoring. Both are connected to an ESP32 microcontroller.' },
  { q: 'How does the AI prediction work?', a: 'The AI model analyzes temperature, humidity, gas levels, and storage duration to predict shelf life, rotting risk, sprouting risk, and spoilage risk using a trained machine learning model.' },
  { q: 'What is the optimal storage condition for onions?', a: 'Onions store best at 20–25°C temperature, 55–70% humidity, and good ventilation to prevent ethylene buildup. Avoid temperatures above 30°C.' },
  { q: 'How often does the system update sensor data?', a: 'Sensor data is read every 30 seconds by the ESP32 and sent to the FastAPI backend. The dashboard auto-refreshes every 5 seconds on the Live Monitoring page.' },
  { q: 'What does the Health Score mean?', a: 'The Health Score (0–100) is a composite metric calculated from temperature, humidity, gas levels, and storage duration. Above 75 is Healthy, 50–75 is Warning, below 50 is Critical.' },
  { q: 'How do I connect the real ESP32 hardware?', a: 'Flash the ESP32 firmware, configure your WiFi credentials and FastAPI server URL in the firmware, then set the FastAPI URL in Settings → API Settings.' },
  { q: 'How do I get weather data?', a: 'Go to Settings → API Settings, enter your free OpenWeatherMap API key from openweathermap.org/api, and set your city. The Weather page will then show live data.' },
  { q: 'Can I export data?', a: 'Yes. The History page supports CSV export of all filtered records. The Analytics page supports CSV and Excel export of reports.' },
];

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', background: open ? '#f9fafb' : '#fff',
        border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{q}</span>
        {open ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
      </button>
      {open && (
        <div style={{ padding: '0 18px 14px', background: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, paddingTop: 12 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

const sections = [
  {
    icon: BookOpen, color: '#2563eb', bg: '#eff6ff',
    title: 'Project Overview',
    content: 'Smart Onion AI is an IoT-based storage monitoring system that uses ESP32 hardware, DHT22 and MQ135 sensors, a FastAPI backend, PostgreSQL database, and an AI prediction model to monitor and predict onion storage conditions in real time.',
  },
  {
    icon: Cpu, color: '#16a34a', bg: '#f0fdf4',
    title: 'Hardware Components',
    content: 'ESP32 Microcontroller — WiFi-enabled controller. DHT22 — Temperature & Humidity sensor (±0.5°C accuracy). MQ135 — Air quality / gas sensor for ethylene detection. Relay Module — Controls cooling fan automatically. 5V Power Supply.',
  },
  {
    icon: Brain, color: '#7c3aed', bg: '#faf5ff',
    title: 'AI Model Explanation',
    content: 'The prediction model is trained on historical onion storage data. It uses temperature, humidity, gas level, and storage days as input features to predict: Shelf Life Remaining (days), Rotting Risk (%), Sprouting Risk (%), Spoilage Risk (%), and overall Storage Health Score.',
  },
];

export default function Help() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860 }}>

      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Help & Documentation</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>Everything you need to know about Smart Onion AI</p>
      </div>

      {/* Info sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sections.map(({ icon: Icon, color, bg, title, content }) => (
          <div key={title} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px', display: 'flex', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 6 }}>{title}</p>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>{content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          Frequently Asked Questions
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)}
        </div>
      </div>

      {/* Contact + Version */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={16} color="#ea580c" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Contact & Support</p>
          </div>
          <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
            For technical support or questions about this project, contact the development team.<br />
            <span style={{ color: '#2563eb', fontWeight: 500 }}>admin@smartonion.io</span>
          </p>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Info size={16} color="#16a34a" />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>About</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['Version',    'v2.1.3'],
              ['Framework',  'React + Vite + FastAPI'],
              ['Hardware',   'ESP32 + DHT22 + MQ135'],
              ['AI Model',   'Random Forest / LSTM'],
              ['Database',   'PostgreSQL'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
