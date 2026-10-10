import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Activity, Brain, BarChart2, History,
  Cpu, Settings, LogOut, Leaf, X, CloudSun, Bell, HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/monitoring',   icon: Activity,        label: 'Live Monitoring' },
  { to: '/predictions',  icon: Brain,           label: 'AI Predictions'  },
  { to: '/analytics',    icon: BarChart2,       label: 'Analytics'       },
  { to: '/history',      icon: History,         label: 'History'         },
  { to: '/weather',      icon: CloudSun,        label: 'Weather'         },
  { to: '/devices',      icon: Cpu,             label: 'Device Status'   },
  { to: '/alerts',       icon: Bell,            label: 'Alerts'          },
  { to: '/settings',     icon: Settings,        label: 'Settings'        },
  { to: '/help',         icon: HelpCircle,      label: 'Help'            },
];

export default function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth();

  return (
    <>
      {open && (
        <div onClick={onClose} className="lg:hidden"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 40 }} />
      )}

      <aside className="lg:!translate-x-0 lg:!static lg:!z-auto"
        style={{
          width: 240, minWidth: 240, height: '100vh',
          background: '#fff', borderRight: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, left: 0, zIndex: 50,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 14px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Leaf size={18} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Smart Onion</p>
              <p style={{ fontSize: 11, color: '#6b7280' }}>AI Storage System</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '6px 10px 8px' }}>Main Menu</p>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon size={16} style={{ flexShrink: 0 }} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Status */}
        <div style={{ padding: '0 10px 10px' }}>
          <div style={{ padding: '10px 12px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
              <div className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>System Online</span>
            </div>
            <p style={{ fontSize: 11, color: '#4ade80' }}>ESP32 · All sensors active</p>
          </div>
        </div>

        {/* User */}
        <div style={{ padding: '10px 10px 14px', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 4px 8px' }}>
            <div style={{ width: 34, height: 34, borderRadius: 99, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Admin User'}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || 'admin@smartonion.io'}</p>
            </div>
          </div>
          <button onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#6b7280'; }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
