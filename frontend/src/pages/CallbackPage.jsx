import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleCallback } from '../services/auth';

export default function CallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const errorParam = params.get('error');

    if (errorParam) {
      setError(params.get('error_description') || errorParam);
      return;
    }

    if (!code || !state) {
      setError('Missing code or state in callback URL');
      return;
    }

    handleCallback(code, state)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
      }}>
        <div style={{
          background: '#fff', borderRadius: 8, padding: 32,
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)', textAlign: 'center',
        }}>
          <h2 style={{ color: '#dc2626', margin: '0 0 12px' }}>Authentication Error</h2>
          <p style={{ color: '#555', margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
    }}>
      <p style={{ color: '#666', fontSize: 18 }}>Completing sign in…</p>
    </div>
  );
}
