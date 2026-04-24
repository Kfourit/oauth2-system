import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleCallback } from '../services/auth';

export default function CallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const errorParam = params.get('error');

    if (errorParam) {
      navigate('/error', {
        replace: true,
        state: {
          title: 'Authentication Error',
          message: params.get('error_description') || errorParam,
        },
      });
      return;
    }

    if (!code || !state) {
      navigate('/error', {
        replace: true,
        state: {
          title: 'Authentication Error',
          message: 'Missing code or state in callback URL.',
        },
      });
      return;
    }

    handleCallback(code, state)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch((err) => navigate('/error', {
        replace: true,
        state: { title: 'Authentication Error', message: err.message },
      }));
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',
    }}>
      <p style={{ color: '#666', fontSize: 18 }}>Completing sign in…</p>
    </div>
  );
}
