import { useEffect, useState } from 'react';
import api from '../api/axios.js';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function Barberos() {
  const [barbers,  setBarbers]  = useState([]);
  const [selected, setSelected] = useState(null);
  const [avail,    setAvail]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/barbers')
      .then(({ data }) => setBarbers(data.barbers || []))
      .finally(() => setLoading(false));
  }, []);

  const openBarber = async (b) => {
    setSelected(b);
    const { data } = await api.get(`/barbers/${b._id}/availability`);
    setAvail(data.availability || []);
  };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <>
      <div className="barbers-grid" style={{ marginBottom: '2rem' }}>
        {barbers.map(b => (
          <div
            key={b._id}
            className="barber-card"
            style={{ cursor: 'pointer', borderLeft: selected?._id === b._id ? '2px solid var(--gold)' : '2px solid transparent' }}
            onClick={() => openBarber(b)}
          >
            <div className="barber-avatar">{initials(b.name)}</div>
            <div className="barber-name">{b.name}</div>
            <div className="barber-email">{b.email}</div>
            {b.phone && <div className="barber-phone">{b.phone}</div>}
          </div>
        ))}
        {barbers.length === 0 && (
          <div style={{ padding: '2rem', color: 'var(--sub)', fontSize: '0.82rem' }}>
            No hay barberos registrados.
          </div>
        )}
      </div>

      {/* Disponibilidad del barbero seleccionado */}
      {selected && (
        <div className="card">
          <div className="section-header">
            <span className="section-title">Disponibilidad — {selected.name}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(null); setAvail([]); }}>
              Cerrar
            </button>
          </div>
          {avail.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '0.82rem' }}>Sin horario configurado.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Día</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Pausa</th>
                    <th>Slot</th>
                  </tr>
                </thead>
                <tbody>
                  {avail.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map(av => (
                    <tr key={av._id}>
                      <td style={{ fontWeight: 700 }}>{DAYS[av.dayOfWeek]}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{av.startTime}</td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{av.endTime}</td>
                      <td style={{ color: 'var(--sub)', fontVariantNumeric: 'tabular-nums' }}>
                        {av.breakStart ? `${av.breakStart} – ${av.breakEnd}` : '—'}
                      </td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>{av.slotDuration}min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
