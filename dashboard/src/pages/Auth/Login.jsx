import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 700));
      login({ name: 'Admin User', email: form.email }, 'mock-token');
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch { toast.error('Invalid credentials'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Leaf size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Smart Onion AI</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '32px 28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Email address', key: 'email', type: 'email', placeholder: 'admin@smartonion.io' },
              { label: 'Password',      key: 'password', type: show ? 'text' : 'password', placeholder: '••••••••' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={type} required value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    style={{
                      width: '100%', padding: '10px 14px', borderRadius: 8,
                      border: '1px solid #e5e7eb', fontSize: 13, color: '#111827',
                      outline: 'none', background: '#f9fafb',
                      paddingRight: key === 'password' ? 40 : 14,
                    }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                  {key === 'password' && (
                    <button type="button" onClick={() => setShow(!show)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '11px', borderRadius: 8, border: 'none',
                background: '#2563eb', color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
                marginTop: 4,
              }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 20 }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
