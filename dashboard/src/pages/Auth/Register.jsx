import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 700));
      login({ name: form.name, email: form.email }, 'mock-token');
      toast.success('Account created!');
      navigate('/dashboard');
    } catch { toast.error('Registration failed'); }
    finally { setLoading(false); }
  };

  const fields = [
    { label: 'Full Name',     key: 'name',     type: 'text',     placeholder: 'John Doe' },
    { label: 'Email address', key: 'email',    type: 'email',    placeholder: 'you@example.com' },
    { label: 'Password',      key: 'password', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Leaf size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Create Account</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Join Smart Onion AI platform</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: '32px 28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {fields.map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{label}</label>
                <input
                  type={type} required value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid #e5e7eb', fontSize: 13, color: '#111827',
                    outline: 'none', background: '#f9fafb',
                  }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            ))}
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '11px', borderRadius: 8, border: 'none',
                background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4,
              }}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
