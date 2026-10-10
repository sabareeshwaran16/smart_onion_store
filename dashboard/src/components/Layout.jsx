import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, Bell, Search, ChevronRight, Settings, Moon, Sun } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const titles = {
  '/dashboard': 'Dashboard', '/monitoring': 'Live Monitoring',
  '/predictions': 'AI Predictions', '/analytics': 'Analytics',
  '/history': 'History', '/weather': 'Weather',
  '/devices': 'Device Status', '/alerts': 'Alerts',
  '/settings': 'Settings', '/help': 'Help',
};

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <span style={{ fontSize: 12, color: '#6b7280' }}>
      {time.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })} &nbsp;
      <span style={{ fontWeight: 600, color: '#374151' }}>{time.toLocaleTimeString()}</span>
    </span>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const pageTitle = titles[pathname] || 'Dashboard';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f5f6fa' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: 60, background: '#fff', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0, gap: 16,
        }}>
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4, display: 'flex' }}>
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>Home</span>
              <ChevronRight size={12} color="#d1d5db" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{pageTitle}</span>
            </div>
          </div>

          {/* Center: clock */}
          <div className="hidden md:block"><LiveClock /></div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Search */}
            <div className="hidden sm:flex" style={{
              alignItems: 'center', gap: 8, background: '#f9fafb',
              border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 12px',
            }}>
              <Search size={13} color="#9ca3af" />
              <input placeholder="Search..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: '#374151', width: 140 }} />
            </div>

            {/* Live badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 99, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 11, fontWeight: 600, color: '#16a34a' }}>
              <div className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
              Live
            </div>

            {/* Dark mode */}
            <button onClick={() => setDark(!dark)}
              style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', color: '#6b7280', padding: 7, display: 'flex' }}>
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Alerts */}
            <Link to="/alerts" style={{ position: 'relative', background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', color: '#6b7280', padding: 7, display: 'flex', textDecoration: 'none' }}>
              <Bell size={15} />
              <span style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '1.5px solid #fff' }} />
            </Link>

            {/* Settings */}
            <Link to="/settings" style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', color: '#6b7280', padding: 7, display: 'flex', textDecoration: 'none' }}>
              <Settings size={15} />
            </Link>

            {/* Avatar */}
            <div style={{ width: 32, height: 32, borderRadius: 99, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <Outlet />
        </main>

        {/* Footer */}
        <footer style={{
          height: 40, background: '#fff', borderTop: '1px solid #f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>© 2025 Smart Onion AI · v2.1.3</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {[
              { label: 'API', ok: true }, { label: 'ESP32', ok: true }, { label: 'DB', ok: true },
            ].map(({ label, ok }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: ok ? '#16a34a' : '#ef4444' }} />
                <span style={{ fontSize: 11, color: '#9ca3af' }}>{label}</span>
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
