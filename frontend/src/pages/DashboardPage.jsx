import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, logout } from '../services/auth';
import api from '../services/api';

const ENDPOINTS = [
  { label: 'GET /api/public/health', path: '/api/public/health' },
  { label: 'GET /api/me', path: '/api/me' },
  { label: 'GET /api/data  (SCOPE_read)', path: '/api/data' },
  { label: 'GET /api/admin (SCOPE_write)', path: '/api/admin' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  if (!isLoggedIn()) {
    navigate('/', { replace: true });
    return null;
  }

  async function call(path) {
    setLoading((l) => ({ ...l, [path]: true }));
    try {
      const res = await api.get(path);
      setResults((r) => ({ ...r, [path]: { ok: true, data: res.data } }));
    } catch (err) {
      const msg = err.response?.data || err.message;
      setResults((r) => ({ ...r, [path]: { ok: false, data: msg } }));
    } finally {
      setLoading((l) => ({ ...l, [path]: false }));
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '48px auto', padding: '0 16px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Dashboard</h1>
        <button
          onClick={logout}
          style={{
            padding: '8px 20px', fontSize: 14, background: '#ef4444',
            color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      {ENDPOINTS.map(({ label, path }) => (
        <div key={path} style={{
          background: '#fff', borderRadius: 8, padding: 20,
          boxShadow: '0 1px 6px rgba(0,0,0,0.08)', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: results[path] ? 12 : 0 }}>
            <button
              onClick={() => call(path)}
              disabled={loading[path]}
              style={{
                padding: '8px 16px', fontSize: 14, fontWeight: 600,
                background: loading[path] ? '#a5b4fc' : '#4f46e5',
                color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer',
              }}
            >
              {loading[path] ? '…' : 'Call'}
            </button>
            <code style={{ fontSize: 13, color: '#374151' }}>{label}</code>
          </div>

          {results[path] && (
            <pre style={{
              margin: 0, padding: 12, borderRadius: 6, fontSize: 12,
              background: results[path].ok ? '#f0fdf4' : '#fef2f2',
              color: results[path].ok ? '#166534' : '#991b1b',
              overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {JSON.stringify(results[path].data, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}
