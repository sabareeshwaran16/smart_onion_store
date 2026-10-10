import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, LayoutDashboard, Activity, Package, Calendar,
  Bell, BarChart2, ChevronLeft, ChevronRight, FileSpreadsheet, ClipboardList
} from 'lucide-react';

const navItems = [
  { to: '/',            icon: Home,            label: 'Home' },
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sensors',     icon: Activity,        label: 'Sensors' },
  { to: '/storage',     icon: Package,         label: 'Storage' },
  { to: '/predictions', icon: FileSpreadsheet, label: 'Predictions' },
  { to: '/forecast',    icon: Calendar,        label: 'Forecast' },
  { to: '/alerts',      icon: Bell,            label: 'Alerts' },
  { to: '/analytics',   icon: BarChart2,       label: 'Analytics' },
  { to: '/guidelines',  icon: ClipboardList,   label: 'Guidelines' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <aside className={`flex flex-col bg-white border-r border-slate-200 transition-all duration-200 ${collapsed ? 'w-14' : 'w-52'} min-h-screen flex-shrink-0 z-30`}>
      {/* Brand Header */}
      <div className={`flex items-center gap-2.5 px-3 py-3 border-b border-slate-200 ${collapsed ? 'justify-center' : ''}`}>
        {!logoError ? (
          <img 
            src="/logo.png" 
            alt="VengAI" 
            className="w-6 h-6 object-contain flex-shrink-0"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">V</span>
          </div>
        )}
        {!collapsed && (
          <div>
            <div className="text-xs font-bold text-slate-900 tracking-wider leading-none uppercase">VengAI</div>
            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Control Panel</div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium uppercase tracking-wider transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={15} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse control */}
      <div className="px-2 pb-3 pt-2 border-t border-slate-200">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors text-[10px] font-bold uppercase tracking-wider"
        >
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
