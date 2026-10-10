import { Cpu, Wifi, Fan, Radio, Zap, Clock } from 'lucide-react';
import { mockDevice } from '../../utils/mockData';

const iconBg = {
  online:    '#f0fdf4', connected: '#eff6ff',
  ON:        '#ecfeff', active:    '#fff7ed', offline: '#f9fafb',
};
const iconColor = {
  online:    '#16a34a', connected: '#2563eb',
  ON:        '#0891b2', active:    '#ea580c', offline: '#9ca3af',
};

function DeviceCard({ title, icon: Icon, status, details }) {
  const isOnline = ['online', 'connected', 'ON', 'active'].includes(status);
  const bg    = iconBg[status]    || iconBg.offline;
  const color = iconColor[status] || iconColor.offline;

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={color} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className={isOnline ? 'pulse-dot' : ''} style={{ width: 6, height: 6, borderRadius: '50%', background: isOnline ? '#16a34a' : '#d1d5db' }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: isOnline ? '#16a34a' : '#9ca3af' }}>{status}</span>
        </div>
      </div>

      <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>{title}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {details.map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Devices() {
  const d = mockDevice;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Device Management</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>Last communication: {new Date(d.lastCommunication).toLocaleTimeString()}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <DeviceCard title="ESP32 Controller"  icon={Cpu}   status={d.esp32.status}  details={[{ label: 'IP Address', value: d.esp32.ip }, { label: 'Firmware', value: d.esp32.firmware }]} />
        <DeviceCard title="DHT22 Sensor"      icon={Radio} status={d.dht22.status}  details={[{ label: 'Type', value: 'Temp & Humidity' }, { label: 'Last Read', value: new Date(d.dht22.lastRead).toLocaleTimeString() }]} />
        <DeviceCard title="MQ-135 Gas Sensor" icon={Radio} status={d.mq135.status}  details={[{ label: 'Type', value: 'Air Quality / Gas' }, { label: 'Last Read', value: new Date(d.mq135.lastRead).toLocaleTimeString() }]} />
        <DeviceCard title="Cooling Fan"       icon={Fan}   status={d.fan.status}    details={[{ label: 'Mode', value: d.fan.mode }, { label: 'Control', value: 'Relay Channel 1' }]} />
        <DeviceCard title="Wi-Fi Module"      icon={Wifi}  status={d.wifi.status}   details={[{ label: 'SSID', value: d.wifi.ssid }, { label: 'Signal', value: `${d.wifi.rssi} dBm` }]} />
        <DeviceCard title="Relay Module"      icon={Zap}   status={d.relay.status}  details={[{ label: 'Channel', value: d.relay.channel }, { label: 'Load', value: 'Fan Control' }]} />
      </div>

      {/* Last comm banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 20px', borderRadius: 12,
        background: '#eff6ff', border: '1px solid #bfdbfe',
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Clock size={18} color="#2563eb" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1e40af' }}>Last Communication</p>
          <p style={{ fontSize: 12, color: '#60a5fa', marginTop: 2 }}>{new Date(d.lastCommunication).toLocaleString()}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>Live</span>
        </div>
      </div>
    </div>
  );
}
