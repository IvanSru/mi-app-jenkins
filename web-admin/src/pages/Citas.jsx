import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios.js';

const TABS = ['all', 'pending', 'accepted', 'rejected', 'cancelled'];
const TAB_LABEL = { all: 'Todas', pending: 'Pendientes', accepted: 'Aceptadas', rejected: 'Rechazadas', cancelled: 'Canceladas' };
const STATUS_CLASS = { pending: 'badge-pending', accepted: 'badge-accepted', rejected: 'badge-rejected', cancelled: 'badge-cancelled', completed: 'badge-completed' };
const STATUS_LABEL = { pending: 'Pendiente', accepted: 'Aceptada', rejected: 'Rechazada', cancelled: 'Cancelada', completed: 'Completada' };

export default function Citas() {
  const [appointments, setAppointments] = useState([]);
  const [tab,          setTab]          = useState('all');
  const [loading,      setLoading]      = useState(true);
  const [acting,       setActing]       = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/appointments/my')
      .then(({ data }) => setAppointments(data.appointments || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const respond = async (id, status) => {
    setActing(id + status);
    try {
      await api.patch(`/appointments/${id}/respond`, { status });
      setAppointments(prev =>
        prev.map(a => a._id === id ? { ...a, status } : a)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Error al procesar la cita');
    } finally {
      setActing(null);
    }
  };

  const visible = tab === 'all' ? appointments : appointments.filter(a => a.status === tab);

  return (
    <>
      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {TAB_LABEL[t]}
            {' '}
            <span style={{ opacity: 0.6, fontVariantNumeric: 'tabular-nums' }}>
              ({appointments.filter(a => t === 'all' || a.status === t).length})
            </span>
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner" />
        ) : visible.length === 0 ? (
          <p className="text-muted" style={{ fontSize: '0.82rem', padding: '1rem 0' }}>Sin citas en esta categoría.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Barbero</th>
                  <th>Servicio</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(a => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 600 }}>{a.client?.name || '—'}</td>
                    <td style={{ color: 'var(--sub)' }}>{a.client?.phone || '—'}</td>
                    <td>{a.barber?.name || '—'}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{a.service?.name || '—'}</span>
                      {a.service?.duration && (
                        <span style={{ color: 'var(--sub)', fontSize: '0.7rem', marginLeft: '0.4rem' }}>
                          {a.service.duration}min
                        </span>
                      )}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--sub)' }}>
                      {new Date(a.date).toLocaleDateString('es-CO')}
                    </td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{a.startTime} – {a.endTime}</td>
                    <td>
                      <span className={`badge ${STATUS_CLASS[a.status]}`}>
                        {STATUS_LABEL[a.status]}
                      </span>
                    </td>
                    <td>
                      {a.status === 'pending' && (
                        <div className="gap-2">
                          <button
                            className="btn btn-green btn-sm"
                            disabled={!!acting}
                            onClick={() => respond(a._id, 'accepted')}
                          >
                            {acting === a._id + 'accepted' ? '...' : '✓ Aceptar'}
                          </button>
                          <button
                            className="btn btn-red btn-sm"
                            disabled={!!acting}
                            onClick={() => respond(a._id, 'rejected')}
                          >
                            {acting === a._id + 'rejected' ? '...' : '✗ Rechazar'}
                          </button>
                        </div>
                      )}
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
