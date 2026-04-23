import { startLogin } from '../services/auth';

export default function LoginPage() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#f0f2f5',
    }}>
      <div style={{
        background: '#fff', borderRadius: 8, padding: '48px 40px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)', textAlign: 'center', minWidth: 320,
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 24 }}>Welcome</h1>
        <p style={{ margin: '0 0 32px', color: '#666' }}>Sign in to continue</p>
        <button
          onClick={startLogin}
          style={{
            width: '100%', padding: '12px 0', fontSize: 16, fontWeight: 600,
            background: '#4f46e5', color: '#fff', border: 'none',
            borderRadius: 6, cursor: 'pointer',
          }}
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
