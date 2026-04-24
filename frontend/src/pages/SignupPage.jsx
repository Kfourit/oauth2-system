import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/auth';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerUser(form.name, form.email, form.password);
      navigate('/', { state: { registered: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: 15,
    border: '1px solid #d1d5db', borderRadius: 6,
    boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#f0f2f5',
    }}>
      <div style={{
        background: '#fff', borderRadius: 8, padding: '48px 40px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)', minWidth: 360,
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 24, textAlign: 'center' }}>Create account</h1>
        <p style={{ margin: '0 0 28px', color: '#666', textAlign: 'center' }}>Sign up to get started</p>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
            borderRadius: 6, padding: '10px 14px', marginBottom: 20, fontSize: 14,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#111' }}>
              Full name
            </span>
            <input
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              style={inputStyle}
            />
          </div>

          <div>
            <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#111' }}>
              Email
            </span>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="jane@example.com"
              style={inputStyle}
            />
          </div>

          <div>
            <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#111' }}>
              Password
            </span>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <div>
            <span style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#111' }}>
              Confirm password
            </span>
            <input
              name="confirm"
              type="password"
              required
              value={form.confirm}
              onChange={handleChange}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px 0', fontSize: 16, fontWeight: 600,
              background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff',
              border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
            }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#666' }}>
          Already have an account?{' '}
          <Link to="/" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
