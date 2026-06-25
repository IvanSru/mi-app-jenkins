import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-brand">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <svg width="36" height="36" viewBox="0 0 30 30" fill="none">
              <path d="M5 7 L21 7 L25 15 L21 23 L5 23 Z" fill="rgba(201,151,46,0.12)" stroke="#C9972E" strokeWidth="1.5"/>
              <line x1="5" y1="15" x2="25" y2="15" stroke="#C9972E" strokeWidth="0.9" opacity="0.6"/>
              <circle cx="9" cy="15" r="2.2" fill="#C9972E"/>
              <line x1="11" y1="15" x2="25" y2="15" stroke="#C9972E" strokeWidth="1.4"/>
            </svg>
          </div>
          <div className="name">BL<em>A</em>DE</div>
          <div className="sub">Panel de Administración</div>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@blade.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}

          <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--card)', borderLeft: '2px solid var(--gold)' }}>
          <p style={{ fontSize: '0.65rem', color: 'var(--sub)', marginBottom: '0.4rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Credenciales demo</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text)' }}>admin@blade.com / Admin123!</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--sub)' }}>jorge@blade.com / Barber123!</p>
        </div>
      </div>
    </div>
  );
}
