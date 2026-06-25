import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

const CATEGORIES = [
  { value: 'corte_caballero', label: 'Corte Caballero' },
  { value: 'corte_dama',      label: 'Corte Dama' },
  { value: 'barba',           label: 'Barba' },
  { value: 'combo',           label: 'Combo' },
  { value: 'manicure',        label: 'Manicure' },
  { value: 'pedicure',        label: 'Pedicure' },
  { value: 'tinte',           label: 'Tinte / Color' },
  { value: 'tratamiento',     label: 'Tratamiento' },
  { value: 'otro',            label: 'Otro' },
];

const EMPTY = { name: '', description: '', category: 'corte_caballero', duration: 30, price: 25000 };

export default function Servicios() {
  const { user }                    = useAuth();
  const [services, setServices]     = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [modal,    setModal]        = useState(false);
  const [form,     setForm]         = useState(EMPTY);
  const [editing,  setEditing]      = useState(null);
  const [saving,   setSaving]       = useState(false);
  const [error,    setError]        = useState('');

  const isAdmin = user?.role === 'admin';

  const load = () => {
    api.get('/services')
      .then(({ data }) => setServices(data.services || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true); };
  const openEdit   = (s) => { setEditing(s._id); setForm({ name: s.name, description: s.description || '', category: s.category, duration: s.duration, price: s.price }); setError(''); setModal(true); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const { data } = await api.put(`/services/${editing}`, form);
        setServices(prev => prev.map(s => s._id === editing ? data.service : s));
      } else {
        const { data } = await api.post('/services', form);
        setServices(prev => [...prev, data.service]);
      }
      setModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('¿Desactivar este servicio?')) return;
    await api.delete(`/services/${id}`);
    setServices(prev => prev.filter(s => s._id !== id));
  };

  const catLabel = (val) => CATEGORIES.find(c => c.value === val)?.label || val;

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <>
      <div className="section-header">
        <span className="section-title">{services.length} servicios activos</span>
        {isAdmin && (
          <button className="btn btn-gold" onClick={openCreate}>+ Nuevo servicio</button>
        )}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Duración</th>
                <th>Precio</th>
                {isAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s._id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{s.name}</div>
                    {s.description && <div style={{ fontSize: '0.72rem', color: 'var(--sub)', marginTop: 2 }}>{s.description}</div>}
                  </td>
                  <td><span className="badge badge-accepted">{catLabel(s.category)}</span></td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{s.duration} min</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--gold)', fontWeight: 700 }}>
                    ${s.price.toLocaleString('es-CO')}
                  </td>
                  {isAdmin && (
                    <td>
                      <div className="gap-2">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>Editar</button>
                        <button className="btn btn-red btn-sm" onClick={() => remove(s._id)}>Eliminar</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Editar servicio' : 'Nuevo servicio'}</span>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select className="form-input form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duración (min)</label>
                  <input type="number" className="form-input" value={form.duration} min={5} max={300}
                    onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Precio (COP)</label>
                <input type="number" className="form-input" value={form.price} min={0}
                  onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} required />
              </div>
              {error && <p className="form-error" style={{ marginBottom: '1rem' }}>{error}</p>}
              <div className="gap-2">
                <button className="btn btn-gold" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
