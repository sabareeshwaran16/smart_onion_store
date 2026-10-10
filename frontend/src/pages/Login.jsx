import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DEMO_USERS = [
  { username: 'sabareesh@gmail.com', password: '12345', role: 'Admin', name: 'Sabareesh' },
];


export default function Login({ onLogin }) {
  const navigate   = useNavigate();
  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const user = DEMO_USERS.find(
      u => u.username === form.username.trim() && u.password === form.password
    );

    if (user) {
      const session = { ...user, loginTime: new Date().toISOString() };
      localStorage.setItem('vengai_user', JSON.stringify(session));
      if (onLogin) onLogin(session);
      navigate('/');
    } else {
      setError('Invalid username or password. Please try again.');
    }
    setLoading(false);
  };

  const handleQuickLogin = (user) => {
    setForm({ username: user.username, password: user.password });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center relative px-4 overflow-hidden">
      {/* Onion storage warehouse background image */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: `url('/background_onion.png')` }}
        />
        <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-[1px]" />
      </div>

      <div className="w-full max-w-md my-8 relative z-10">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="VengAI"
                className="w-12 h-12 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white text-xl font-bold">V</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">VengAI</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-semibold tracking-wider uppercase">
            Onion Storage Monitoring System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">Sign In</h2>
          <p className="text-xs text-slate-500 mb-6">Enter your credentials to access the storage dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="Enter username"
                className="input"
                required
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter password"
                  className="input pr-14"
                  required
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors text-xs font-semibold px-1"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-md px-3.5 py-2.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200">
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 rounded-lg font-semibold text-xs uppercase tracking-wider disabled:opacity-60 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-3">
            Demo Credentials — click to fill
          </p>
          <div className="space-y-1.5">
            {DEMO_USERS.map(u => (
              <button
                key={u.username}
                id={`demo-login-${u.username}`}
                onClick={() => handleQuickLogin(u)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors hover:bg-slate-50 border border-slate-100"
              >
                <span className="font-semibold text-slate-800">{u.username}</span>
                <span className="text-slate-400">{u.password}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-6 font-medium">
          VengAI Storage System · Facility Management Platform
        </p>
      </div>
    </div>
  );
}
