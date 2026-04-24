import { useLocation, useNavigate } from 'react-router-dom';

export default function ErrorPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const title = state?.title || 'Page not found';
  const message = state?.message || "The page you're looking for doesn't exist.";

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#f0f2f5',
    }}>
      <div style={{
        background: '#fff', borderRadius: 8, padding: '48px 40px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: 420,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#9888;</div>
        <h1 style={{ margin: '0 0 12px', fontSize: 22, color: '#111' }}>{title}</h1>
        <p style={{ margin: '0 0 32px', color: '#666', fontSize: 15, lineHeight: 1.5 }}>{message}</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 28px', fontSize: 15, fontWeight: 600,
            background: '#4f46e5', color: '#fff', border: 'none',
            borderRadius: 6, cursor: 'pointer',
          }}
        >
          Back to login
        </button>
      </div>
    </div>
  );
}
