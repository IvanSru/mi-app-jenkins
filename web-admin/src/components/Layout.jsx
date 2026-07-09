import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../hooks/useSocket.js';
import { useState, useCallback } from 'react';

const NAV = [
  { to: '/dashboard', label: 'Dashboard',  icon: <IconGrid /> },
  { to: '/citas',     label: 'Citas',      icon: <IconCal /> },
  { to: '/barberos',  label: 'Barberos',   icon: <IconUser /> },
  { to: '/servicios', label: 'Servicios',  icon: <IconList /> },
];

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', sub: 'Vista general del negocio' },
  '/citas':     { title: 'Citas',     sub: 'Gestión de reservas' },
  '/barberos':  { title: 'Barberos',  sub: 'Equipo de profesionales' },
  '/servicios': { title: 'Servicios', sub: 'Catálogo de servicios' },
};

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const page = PAGE_TITLES[location.pathname] || { title: 'SAMAY', sub: '' };

  const [toast, setToast] = useState(null);

  const onEvent = useCallback((type, data) => {
    if (type === 'new_appointment') {
      setToast(`Nueva cita solicitada por ${data.client?.name || 'un cliente'}`);
      setTimeout(() => setToast(null), 4000);
    }
  }, []);

  useSocket(user, onEvent);

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-mark" />
          <span className="logo-text">SAMAY<em> Sharp</em></span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={logout}>Cerrar sesión</button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-area">
        <header className="topbar">
          <div>
            <div className="topbar-title">{page.title}</div>
            <div className="topbar-sub">{page.sub}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {toast && (
              <div style={{ background: 'var(--emerald-lo)', border: '1px solid var(--emerald)', padding: '0.4rem 0.85rem', fontSize: '0.72rem', color: '#14532D', borderRadius: '2px' }}>
                🔔 {toast}
              </div>
            )}
            <div style={{ width: 32, height: 32, background: 'var(--emerald-lo)', border: '2px solid var(--emerald)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 900, color: 'var(--forest)' }}>
              {initials}
            </div>
          </div>
        </header>

        <div className="page-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function IconGrid() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></svg>;
}
function IconCal() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="12"/><line x1="5" y1="1" x2="5" y2="5"/><line x1="11" y1="1" x2="11" y2="5"/><line x1="1" y1="7" x2="15" y2="7"/></svg>;
}
function IconUser() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3 2.7-5 6-5s6 2 6 5"/></svg>;
}
function IconList() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="4" x2="13" y2="4"/><line x1="3" y1="8" x2="13" y2="8"/><line x1="3" y1="12" x2="13" y2="12"/></svg>;
}
