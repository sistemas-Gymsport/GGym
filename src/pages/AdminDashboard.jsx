import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('branding');
  const [cmsData, setCmsData] = useState({
    brandSettings: { id: 1, brandName: '', logoUrl: '', accentColor: '#f64851' },
    hero: { id: 1, title: '', subtitle: '', imageUrl: '' },
    locations: []
  });
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('geo_gym_session');
    if (!session) navigate('/login');
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/cms');
      const result = await res.json();
      if (result.success) setCmsData(result.data);
      
      const leadsRes = await fetch('/api/lead');
      const leadsResult = await leadsRes.json();
      if (leadsResult.success) setLeads(leadsResult.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (tableName, targetField, value, entityId) => {
    setSavingStatus('guardando');
    try {
      const response = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, targetField, value, entityId, action: 'update_text' })
      });
      const result = await response.json();
      if (result.success) {
        setCmsData(prev => ({
          ...prev,
          [tableName === 'locations' ? 'locations' : tableName]: 
            tableName === 'locations' 
              ? prev.locations.map(loc => loc.id === entityId ? { ...loc, [targetField]: value } : loc)
              : { ...prev[tableName], [targetField]: value }
        }));
        setSavingStatus('guardado');
        setTimeout(() => setSavingStatus(null), 1500);
      } else {
        throw new Error('Error API');
      }
    } catch (err) {
      setSavingStatus('error');
      setTimeout(() => setSavingStatus(null), 2500);
    }
  };

  const handleAddLocation = async () => {
    setSavingStatus('creando');
    try {
      const response = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_location' })
      });
      const result = await response.json();
      if (result.success) {
        setCmsData(prev => ({
          ...prev,
          locations: [...prev.locations, result.data]
        }));
        setEditingLoc(result.data);
        setIsModalOpen(true);
        setSavingStatus('guardado');
        setTimeout(() => setSavingStatus(null), 1500);
      } else {
        throw new Error('Error API');
      }
    } catch (err) {
      setSavingStatus('error');
      setTimeout(() => setSavingStatus(null), 2500);
    }
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta sucursal?')) return;
    if (!window.confirm('Esta acción es irreversible. ¿Confirmas la eliminación definitiva?')) return;
    setSavingStatus('eliminando');
    try {
      const response = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_location', entityId: id })
      });
      const result = await response.json();
      if (result.success) {
        setCmsData(prev => ({
          ...prev,
          locations: prev.locations.filter(loc => loc.id !== id)
        }));
        setSavingStatus('guardado');
        setIsModalOpen(false);
        setTimeout(() => setSavingStatus(null), 1500);
      } else {
        throw new Error('Error API');
      }
    } catch (err) {
      setSavingStatus('error');
      setTimeout(() => setSavingStatus(null), 2500);
    }
  };

  const handleImageUpload = async (e, entityId, targetField, tableName) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setSavingStatus('subiendo_imagen');
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const response = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: reader.result, entityId, targetField, tableName })
        });
        const result = await response.json();
        if (result.success) {
          if (tableName === 'locations' && editingLoc && editingLoc.id === entityId) {
            setEditingLoc(prev => ({ ...prev, [targetField]: result.url }));
          }
          setCmsData(prev => ({
            ...prev,
            [tableName === 'locations' ? 'locations' : tableName]: 
              tableName === 'locations' 
                ? prev.locations.map(loc => loc.id === entityId ? { ...loc, [targetField]: result.url } : loc)
                : { ...prev[tableName], [targetField]: result.url }
          }));
          setSavingStatus('imagen_subida');
          setTimeout(() => setSavingStatus(null), 1500);
        } else {
          throw new Error('Error subida');
        }
      } catch (err) {
        setSavingStatus('error');
        setTimeout(() => setSavingStatus(null), 2500);
      }
    };
  };

  const handleDeleteImage = async (url, entityId, targetField, tableName) => {
    if (!url) return;
    setSavingStatus('eliminando_imagen');
    try {
      const parts = url.split('/');
      const filename = parts.pop().split('.')[0];
      const folder = parts.pop();
      const publicId = `${folder}/${filename}`;

      const response = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId, entityId, targetField, tableName })
      });
      const result = await response.json();
      if (result.success) {
        if (tableName === 'locations' && editingLoc && editingLoc.id === entityId) {
          setEditingLoc(prev => ({ ...prev, [targetField]: '' }));
        }
        setCmsData(prev => ({
          ...prev,
          [tableName === 'locations' ? 'locations' : tableName]: 
            tableName === 'locations' 
              ? prev.locations.map(loc => loc.id === entityId ? { ...loc, [targetField]: '' } : loc)
              : { ...prev[tableName], [targetField]: '' }
        }));
        setSavingStatus('guardado');
        setTimeout(() => setSavingStatus(null), 1500);
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (err) {
      setSavingStatus('error');
      setTimeout(() => setSavingStatus(null), 2500);
    }
  };

  const openLocationModal = (loc) => {
    setEditingLoc(loc);
    setIsModalOpen(true);
  };

  const openLeadModal = (lead = null) => {
    if (lead) {
      setEditingLead(lead);
    } else {
      setEditingLead({ name: '', email: '', phone: '', location: '' });
    }
    setIsLeadModalOpen(true);
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    setSavingStatus('guardando');
    try {
      const isUpdate = !!editingLead.id;
      const payload = isUpdate
        ? { action: 'update', ...editingLead }
        : { ...editingLead };

      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        if (isUpdate) {
          setLeads(leads.map(l => l.id === result.data.id ? result.data : l));
        } else {
          setLeads([result.data, ...leads]);
        }
        setIsLeadModalOpen(false);
        setSavingStatus('guardado');
        setTimeout(() => setSavingStatus(null), 1500);
      } else {
        throw new Error('Error API');
      }
    } catch (err) {
      setSavingStatus('error');
      setTimeout(() => setSavingStatus(null), 2500);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este prospecto?')) return;
    if (!window.confirm('Esta acción eliminará el registro de la base de datos permanentemente. ¿Confirmar?')) return;
    
    setSavingStatus('eliminando');
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      const result = await response.json();
      if (result.success) {
        setLeads(leads.filter(l => l.id !== id));
        setIsLeadModalOpen(false);
        setSavingStatus('guardado');
        setTimeout(() => setSavingStatus(null), 1500);
      } else {
        throw new Error('Error API');
      }
    } catch (err) {
      setSavingStatus('error');
      setTimeout(() => setSavingStatus(null), 2500);
    }
  };

  const menuItems = [
    { id: 'branding', label: 'Identidad y Logo' },
    { id: 'hero', label: 'Sección Hero' },
    { id: 'locations', label: 'Sucursales y Mapas' },
    { id: 'leads', label: 'Prospectos / Leads' }
  ];

  if (loading || !cmsData) return <div style={{ padding: '5rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>Cargando Panel GEO GYM...</div>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h1>GEO <span>GYM</span></h1>
          <p>CMS Control de Ubicaciones</p>
        </div>
        <nav className="admin-nav">
          {menuItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => setActiveSection(item.id)} 
              className={`admin-nav-btn ${activeSection === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="admin-logout-wrapper">
          <button 
            onClick={() => { localStorage.removeItem('geo_gym_session'); navigate('/login'); }} 
            className="btn-logout"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h2>{menuItems.find(i => i.id === activeSection)?.label || ''}</h2>
          <div className="admin-header-actions">
            {savingStatus && (
              <span className={`status-message ${savingStatus === 'guardado' || savingStatus === 'imagen_subida' ? 'status-success' : 'status-error'}`} style={{ margin: 0, padding: '0.5rem 1rem' }}>
                {savingStatus.replace('_', ' ').toUpperCase()}
              </span>
            )}
            <button onClick={() => { window.location.reload(); }} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              Recargar Datos
            </button>
          </div>
        </header>

        {activeSection === 'branding' && (
          <div className="admin-card">
            <div className="admin-grid">
              <div className="admin-stack">
                <div className="form-group">
                  <label className="form-label">Nombre de Marca</label>
                  <input 
                    type="text" 
                    defaultValue={cmsData.brandSettings.brandName} 
                    onBlur={(e) => handleUpdate('brand_settings', 'brandName', e.target.value, cmsData.brandSettings.id)} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Color de Acento Hexadecimal</label>
                  <div className="color-picker-wrapper">
                    <div className="color-preview" style={{ backgroundColor: cmsData.brandSettings.accentColor }}></div>
                    <input 
                      type="text" 
                      defaultValue={cmsData.brandSettings.accentColor} 
                      onBlur={(e) => handleUpdate('brand_settings', 'accentColor', e.target.value, cmsData.brandSettings.id)} 
                      className="form-input" 
                      placeholder="#f64851" 
                    />
                  </div>
                </div>
              </div>
              <div className="admin-stack">
                <div className="form-group">
                  <label className="form-label">Logo GEO GYM</label>
                  <div className="image-preview-box">
                    <img src={cmsData.brandSettings.logoUrl || '/logo-placeholder.png'} alt="Logo CMS" />
                    <input 
                      type="file" 
                      onChange={(e) => handleImageUpload(e, cmsData.brandSettings.id, 'logoUrl', 'brand_settings')} 
                    />
                    {cmsData.brandSettings.logoUrl && (
                      <button onClick={() => handleDeleteImage(cmsData.brandSettings.logoUrl, cmsData.brandSettings.id, 'logoUrl', 'brand_settings')} className="btn-delete">
                        Eliminar Imagen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'hero' && (
          <div className="admin-card">
            <div className="admin-grid">
              <div className="admin-stack">
                <div className="form-group">
                  <label className="form-label">Título de la Landing</label>
                  <input 
                    type="text" 
                    defaultValue={cmsData.hero.title} 
                    onBlur={(e) => handleUpdate('hero_settings', 'title', e.target.value, cmsData.hero.id)} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subtítulo</label>
                  <textarea 
                    defaultValue={cmsData.hero.subtitle} 
                    onBlur={(e) => handleUpdate('hero_settings', 'subtitle', e.target.value, cmsData.hero.id)} 
                    rows={4} 
                    className="form-input" 
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>
              </div>
              <div className="admin-stack">
                <div className="form-group">
                  <label className="form-label">Imagen Hero Principal</label>
                  <div className="image-preview-box">
                    <img src={cmsData.hero.imageUrl || '/hero-placeholder.jpg'} alt="Hero CMS" />
                    <input 
                      type="file" 
                      onChange={(e) => handleImageUpload(e, cmsData.hero.id, 'imageUrl', 'hero_settings')} 
                    />
                    {cmsData.hero.imageUrl && (
                      <button onClick={() => handleDeleteImage(cmsData.hero.imageUrl, cmsData.hero.id, 'imageUrl', 'hero_settings')} className="btn-delete">
                        Eliminar Imagen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'locations' && (
          <div>
            <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3>Gestión de Sucursales</h3>
              <button onClick={handleAddLocation} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }}>
                + Añadir Sucursal
              </button>
            </div>
            
            <div className="list-grid">
              {cmsData.locations.map((loc) => (
                <div key={loc.id} className="location-item">
                  <h4>{loc.name}</h4>
                  <p>{loc.address}</p>
                  <div className="location-item-actions">
                    <button onClick={() => openLocationModal(loc)} className="btn-edit" style={{ flex: 1 }}>
                      Editar Datos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'leads' && (
          <div className="admin-card data-table-wrapper" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', margin: 0, borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0 }}>Registro de Prospectos</h3>
              <button onClick={() => openLeadModal()} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }}>
                + Añadir Prospecto
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo Electrónico</th>
                  <th>Teléfono</th>
                  <th>Sucursal</th>
                  <th>Fecha Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td><strong>{lead.name}</strong></td>
                    <td>{lead.email}</td>
                    <td>{lead.phone}</td>
                    <td>{lead.location}</td>
                    <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => openLeadModal(lead)} className="btn-edit" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {isModalOpen && editingLoc && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Sucursal: {editingLoc.name}</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-close">&times;</button>
            </div>
            <div className="modal-body">
              <div className="admin-grid">
                <div className="admin-stack">
                  <div className="form-group">
                    <label className="form-label">Nombre de la Ubicación</label>
                    <input 
                      type="text" 
                      defaultValue={editingLoc.name} 
                      onBlur={(e) => {
                        handleUpdate('locations', 'name', e.target.value, editingLoc.id);
                        setEditingLoc({...editingLoc, name: e.target.value});
                      }} 
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dirección Completa</label>
                    <input 
                      type="text" 
                      defaultValue={editingLoc.address} 
                      onBlur={(e) => {
                        handleUpdate('locations', 'address', e.target.value, editingLoc.id);
                        setEditingLoc({...editingLoc, address: e.target.value});
                      }} 
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Precio Destacado</label>
                    <input 
                      type="text" 
                      defaultValue={editingLoc.price} 
                      onBlur={(e) => {
                        handleUpdate('locations', 'price', e.target.value, editingLoc.id);
                        setEditingLoc({...editingLoc, price: e.target.value});
                      }} 
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amenidades y Descripción (Usa saltos de línea y viñetas •)</label>
                    <textarea 
                      defaultValue={editingLoc.amenities} 
                      onBlur={(e) => {
                        handleUpdate('locations', 'amenities', e.target.value, editingLoc.id);
                        setEditingLoc({...editingLoc, amenities: e.target.value});
                      }} 
                      className="form-input" 
                      rows={8}
                    ></textarea>
                  </div>
                </div>
                <div className="admin-stack">
                  <div className="form-group">
                    <label className="form-label">Imagen de Sucursal</label>
                    <div className="image-preview-box">
                      <img src={editingLoc.imageUrl || '/location-placeholder.jpg'} alt="Preview" />
                      <input 
                        type="file" 
                        onChange={(e) => handleImageUpload(e, editingLoc.id, 'imageUrl', 'locations')} 
                      />
                      {editingLoc.imageUrl && (
                        <button onClick={() => handleDeleteImage(editingLoc.imageUrl, editingLoc.id, 'imageUrl', 'locations')} className="btn-delete">
                          Eliminar Imagen
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => handleDeleteLocation(editingLoc.id)} className="btn-delete">
                Eliminar Sucursal Definitivamente
              </button>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-primary">
                Cerrar y Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {isLeadModalOpen && editingLead && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>{editingLead.id ? 'Editar Prospecto' : 'Añadir Nuevo Prospecto'}</h3>
              <button onClick={() => setIsLeadModalOpen(false)} className="btn-close">&times;</button>
            </div>
            <form onSubmit={handleSaveLead}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input 
                    type="text" 
                    required 
                    value={editingLead.name} 
                    onChange={(e) => setEditingLead({...editingLead, name: e.target.value})} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input 
                    type="email" 
                    required 
                    value={editingLead.email} 
                    onChange={(e) => setEditingLead({...editingLead, email: e.target.value})} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input 
                    type="tel" 
                    value={editingLead.phone} 
                    onChange={(e) => setEditingLead({...editingLead, phone: e.target.value})} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sucursal de Interés</label>
                  <select 
                    value={editingLead.location} 
                    onChange={(e) => setEditingLead({...editingLead, location: e.target.value})} 
                    className="form-input"
                  >
                    <option value="">Seleccione una sucursal</option>
                    {cmsData.locations.map(loc => (
                      <option key={loc.id} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                {editingLead.id && (
                  <button type="button" onClick={() => handleDeleteLead(editingLead.id)} className="btn-delete">
                    Eliminar Prospecto
                  </button>
                )}
                <button type="submit" className="btn btn-primary">
                  Guardar Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}