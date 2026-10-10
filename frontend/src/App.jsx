import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { getBatches } from './api/client';
import Login        from './pages/Login';
import Home         from './pages/Home';
import Dashboard    from './pages/Dashboard';
import Sensors      from './pages/Sensors';
import Storage      from './pages/Storage';
import Predictions  from './pages/Predictions';
import FutureForecast from './pages/FutureForecast';
import Alerts       from './pages/Alerts';
import Analytics    from './pages/Analytics';

import Guidelines   from './pages/Guidelines';

const NAV_LINKS = [
  { to: '/',            label: 'Home' },
  { to: '/dashboard',   label: 'Dashboard' },
  { to: '/sensors',     label: 'Sensors' },
  { to: '/storage',     label: 'Storage' },
  { to: '/predictions', label: 'Predictions' },
  { to: '/forecast',    label: 'Forecast' },
  { to: '/alerts',      label: 'Alerts' },
  { to: '/analytics',   label: 'Analytics' },

  { to: '/guidelines', label: 'Guidelines' },
];

function TopBar({ selectedBatchId, onBatchChange, batches, user, onLogout }) {
  const [logoError, setLogoError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <header className="border-b border-slate-200 bg-white px-4 sm:px-6 py-2.5 flex items-center justify-between flex-shrink-0 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          {!logoError ? (
            <img 
              src="/logo.png" 
              alt="VengAI" 
              className="w-7 h-7 object-contain flex-shrink-0"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">V</span>
            </div>
          )}
          <div>
            <div className="text-xs font-bold text-slate-900 tracking-wider uppercase leading-none">VengAI</div>
            <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Storage Control</div>
          </div>
        </Link>
      </div>

      {/* Center Nav Links */}
      <div className="hidden xl:flex items-center gap-x-5">
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => 
              `text-[11px] font-semibold uppercase tracking-wider transition-colors py-1 ${
                isActive ? 'text-slate-900 border-b-2 border-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Right side telemetry info */}
      <div className="flex items-center gap-4 text-xs">
        {/* Active Batch */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">Active Batch:</span>
          {batches && batches.length > 0 ? (
            <select
              value={selectedBatchId}
              onChange={(e) => onBatchChange(e.target.value)}
              className="bg-white border border-slate-300 text-slate-900 text-[11px] font-bold uppercase tracking-wider rounded px-2.5 py-1 focus:outline-none focus:border-slate-900 cursor-pointer shadow-sm"
            >
              {batches.map(b => (
                <option key={b.batch_id} value={b.batch_id} className="bg-white text-slate-900">
                  {b.batch_id}{b.onion_variety ? ` (${b.onion_variety})` : ''}
                </option>
              ))}
            </select>
          ) : (
            <Link
              to="/storage"
              className="bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-[10px] font-bold uppercase tracking-wider rounded px-2 py-1 transition-colors flex items-center gap-1 shadow-sm"
            >
              <span>+ New Batch</span>
            </Link>
          )}
        </div>

        {/* System Online */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
          <span className="text-[10px] text-emerald-800 uppercase tracking-wider font-bold">ONLINE</span>
        </div>

        {/* Last Sync */}
        <div className="hidden md:block text-[10px] text-slate-500 font-medium border-l border-slate-200 pl-3">
          <span>SYNC: {currentTimeStr}</span>
        </div>

        {/* User Badge + Logout */}
        {user && (
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="text-[10px] font-medium text-slate-600">
              <span className="font-bold text-slate-900">{user.name}</span>
              <span className="text-slate-500 font-bold ml-1">({user.role})</span>
            </div>
            <button
              onClick={onLogout}
              className="text-[10px] text-slate-500 hover:text-red-600 font-bold uppercase tracking-wider transition-colors ml-1"
              title="Sign Out"
            >
              Exit
            </button>
          </div>
        )}

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="xl:hidden p-1.5 rounded bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="xl:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 px-4 py-4 space-y-2 shadow-xl z-50">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                  isActive ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between px-3">
              <div>
                <span className="text-xs font-bold text-slate-900">{user.name}</span>
                <span className="text-[9px] text-slate-500 font-bold ml-2">({user.role})</span>
              </div>
              <button onClick={onLogout} className="text-[9px] text-red-600 hover:text-red-700 font-bold uppercase tracking-wider">
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function Layout({ user, onLogout }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState(
    localStorage.getItem('vengai_selected_batch') || ''
  );

  const fetchBatches = () => {
    getBatches(true)
      .then(res => {
        if (res && res.data) {
          const list = res.data;
          setBatches(list);
          if (list.length > 0) {
            const exists = list.some(b => b.batch_id === selectedBatchId);
            if (!exists || !selectedBatchId) {
              const firstId = list[0].batch_id;
              setSelectedBatchId(firstId);
              localStorage.setItem('vengai_selected_batch', firstId);
            }
          } else {
            setSelectedBatchId('');
            localStorage.removeItem('vengai_selected_batch');
          }
        }
      })
      .catch(err => console.error('Error fetching global batches:', err));
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleBatchChange = (id) => {
    setSelectedBatchId(id);
    localStorage.setItem('vengai_selected_batch', id);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 relative">
      {/* Onion storage warehouse background image */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url('/background_onion.png')` }}
        />
        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[1px]" />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <TopBar 
          selectedBatchId={selectedBatchId} 
          onBatchChange={handleBatchChange} 
          batches={batches}
          user={user}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/"             element={<Home selectedBatchId={selectedBatchId} />} />
              <Route path="/dashboard"    element={<Dashboard selectedBatchId={selectedBatchId} />} />
              <Route path="/sensors"      element={<Sensors selectedBatchId={selectedBatchId} />} />
              <Route path="/storage"      element={<Storage onBatchesUpdated={fetchBatches} />} />
              <Route path="/predictions"  element={<Predictions selectedBatchId={selectedBatchId} onBatchChange={handleBatchChange} />} />
              <Route path="/forecast"     element={<FutureForecast selectedBatchId={selectedBatchId} onBatchChange={handleBatchChange} />} />
              <Route path="/alerts"       element={<Alerts />} />
              <Route path="/analytics"    element={<Analytics selectedBatchId={selectedBatchId} onBatchChange={handleBatchChange} />} />

              <Route path="/guidelines"    element={<Guidelines selectedBatchId={selectedBatchId} />} />
              <Route path="*"             element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

const DEFAULT_USER = { username: 'admin', role: 'Admin', name: 'Admin User' };

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vengai_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const handleLogin  = (session) => setUser(session);
  const handleLogout = () => {
    localStorage.removeItem('vengai_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/*"
          element={user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
