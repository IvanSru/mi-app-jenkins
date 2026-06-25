import { useEffect, useState } from 'react';
import api from '../api/axios.js';

const STATUS_LABEL = { pending: 'Pendiente', accepted: 'Aceptada', rejected: 'Rechazada', cancelled: 'Cancelada', completed: 'Completada' };
const STATUS_CLASS = { pending: 'badge-pending', accepted: 'badge-accepted', rejected: 'badge-rejected', cancelled: 'badge-cancelled', completed: 'badge-completed' };

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [barbers,      setBarbers]      = useState([]);
  const [services,     setServices]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/appointments/my'),
      api.get('/barbers'),
      api.get('/services'),
    ])
      .then(([citas, barbs, svcs]) => {
        setAppointments(citas.data.appointments || []);
        setBarbers(barbs.data.barbers || []);
        setServices(svcs.data.services || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  const pending   = appointments.filter(a => a.status === 'pending').length;
  const accepted  = appointments.filter(a => a.status === 'accepted').length;
  const today     = appointments.filter(a => {
    const d = new Date(a.date);
    const n = new Date();
    return d.toDateString() === n.toDateString() && a.status === 'accepted';
  }).length;

  const recent = [...appointments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  return (
    <>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total citas</div>
          <div className="stat-value gold">{appointments.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pendientes</div>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>{pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Confirmadas</div>
          <div className="stat-value green">{accepted}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Hoy confirmadas</div>
          <div className="stat-value blue">{today}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Barberos activos</div>
          <div className="stat-value" style={{ color: 'var(--text)' }}>{barbers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Servicios</div>
          <div className="stat-value" style={{ color: 'var(--text)' }}>{services.length}</div>
        </div>
      </div>

      {/* Recent appointments */}
      <div className="card">
        <div className="section-header">
          <span className="section-title">Últimas citas</span>
        </div>
        {recent.length === 0 ? (
          <p className="text-muted" style={{ fontSize: '0.82rem', padding: '1rem 0' }}>No hay citas registradas aún.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Barbero</th>
                  <th>Servicio</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(a => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 600 }}>{a.client?.name || '—'}</td>
                    <td>{a.barber?.name || '—'}</td>
                    <td>{a.service?.name || '—'}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--sub)' }}>
                      {new Date(a.date).toLocaleDateString('es-CO')}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums' }}>{a.startTime}</td>
                    <td>
                      <span className={`badge ${STATUS_CLASS[a.status]}`}>
                        {STATUS_LABEL[a.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
