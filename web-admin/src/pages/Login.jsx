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
      setError(err.response?.data?.message || 'Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ── Panel izquierdo — identidad ── */}
      <div className="login-panel-left">
        <div className="brand-logo">SAM<em>A</em>Y</div>
        <div className="brand-tag">Barbería &amp; Studio</div>
        <div className="brand-desc">
          Gestiona tu barbería con precisión. Citas, servicios y equipo en un solo lugar.
        </div>
        <div className="brand-pills">
          {['Corte', 'Barba', 'Manicure', 'Pedicure', 'Tinte', 'Keratina'].map(s => (
            <span key={s} className="pill">{s}</span>
          ))}
        </div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div className="login-panel-right">
        <div className="login-box">
          <div className="form-title">Bienvenido</div>
          <div className="form-sub">Ingresa a tu panel administrativo</div>

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-input"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
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
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.6rem 0.85rem',
                marginBottom: '1rem',
                borderRadius: '2px',
              }}>
                {error}
              </div>
            )}

            <button
              className="btn btn-login"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              {loading ? 'Verificando…' : 'Ingresar al panel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
