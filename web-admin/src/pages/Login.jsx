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
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <circle cx="19" cy="19" r="18" fill="rgba(184,134,11,0.08)" stroke="#B8860B" strokeWidth="1.5"/>
              <path d="M10 13 Q19 8 28 13 L28 25 Q19 30 10 25 Z" fill="rgba(184,134,11,0.15)" stroke="#B8860B" strokeWidth="1.2"/>
              <line x1="10" y1="19" x2="28" y2="19" stroke="#B8860B" strokeWidth="1"/>
              <circle cx="19" cy="19" r="2.5" fill="#B8860B"/>
            </svg>
          </div>
          <div className="name">SAM<em>A</em>Y</div>
          <div className="sub">Barbería &amp; Studio · Panel Administrativo</div>
        </div>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="correo@ejemplo.com"
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

          <button
            className="btn btn-login"
            style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', fontSize: '0.78rem' }}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
