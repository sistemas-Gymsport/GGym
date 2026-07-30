import { useState, useEffect } from 'react';
import './branches.css';

const columns = [
  'name', 'short_name', 'maps_url', 'address', 'monday_friday_hours',
  'saturday_hours', 'sunday_hours', 'visit_price', 'week_price',
  'monthly_price', 'quarterly_price', 'semester_price', 'annual_price',
  'student_price', 'couple_price', 'group_price', 'special_schedule',
  'special_price', 'monthly_requirements', 'student_requirements',
  'group_requirements', 'payment_methods', 'whatsapp', 'social_media',
  'promotion_title', 'promotion_description', 'extra_information'
];

export default function BranchesManager() {
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/branches');
      const data = await res.json();
      setBranches(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    try {
      await fetch('/api/branches', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setIsModalOpen(false);
      fetchBranches();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar sucursal?')) return;
    try {
      await fetch('/api/branches', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchBranches();
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = (branch = null) => {
    if (branch) {
      setFormData(branch);
    } else {
      const emptyForm = columns.reduce((acc, col) => ({ ...acc, [col]: '' }), {});
      setFormData(emptyForm);
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="admin-container">
      <div className="header-actions">
        <h1>Gestión de Sucursales GeoGym</h1>
        <button className="btn-primary" onClick={() => openModal()}>Añadir Sucursal</button>
      </div>

      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div className="table-responsive">
          <table className="branches-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Nombre Corto</th>
                <th>Dirección</th>
                <th>WhatsApp</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id || b.name}>
                  <td>{b.name}</td>
                  <td>{b.short_name}</td>
                  <td>{b.address}</td>
                  <td>{b.whatsapp}</td>
                  <td className="action-cells">
                    <button className="btn-edit" onClick={() => openModal(b)}>Editar</button>
                    <button className="btn-delete" onClick={() => handleDelete(b.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{formData.id ? 'Editar' : 'Nueva'} Sucursal</h2>
            <form onSubmit={handleSave} className="branch-form">
              {columns.map((col) => (
                <div className="form-group" key={col}>
                  <label>{col.replace(/_/g, ' ').toUpperCase()}</label>
                  <input
                    type={col.includes('price') ? 'number' : 'text'}
                    name={col}
                    value={formData[col] || ''}
                    onChange={handleChange}
                    step={col.includes('price') ? '0.01' : undefined}
                  />
                </div>
              ))}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}