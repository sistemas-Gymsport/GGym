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
    setSavingStatus('guardando');
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
    setSavingStatus('guardando');
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
            
            {cmsData.locations.map((loc, index) => (
              <div key={loc.id} className="admin-card">
                <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Sucursal {index + 1}: {loc.name}</h3>
                  <button onClick={() => handleDeleteLocation(loc.id)} className="btn-delete">
                    Eliminar Sucursal
                  </button>
                </div>
                <div className="admin-grid">
                  <div className="admin-stack">
                    <div className="form-group">
                      <label className="form-label">Nombre de la Ubicación</label>
                      <input 
                        type="text" 
                        defaultValue={loc.name} 
                        onBlur={(e) => handleUpdate('locations', 'name', e.target.value, loc.id)} 
                        className="form-input" 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dirección Completa</label>
                      <input 
                        type="text" 
                        defaultValue={loc.address} 
                        onBlur={(e) => handleUpdate('locations', 'address', e.target.value, loc.id)} 
                        className="form-input" 
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label className="form-label">Precio Mensual</label>
                        <input 
                          type="text" 
                          defaultValue={loc.price} 
                          onBlur={(e) => handleUpdate('locations', 'price', e.target.value, loc.id)} 
                          className="form-input" 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Amenidades (Bloque de texto)</label>
                        <textarea 
                          defaultValue={loc.amenities} 
                          onBlur={(e) => handleUpdate('locations', 'amenities', e.target.value, loc.id)} 
                          className="form-input" 
                          rows={6}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="admin-stack">
                    <div className="form-group">
                      <label className="form-label">Imagen de Sucursal</label>
                      <div className="image-preview-box">
                        <img src={loc.imageUrl || '/location-placeholder.jpg'} alt={`CMS Location ${index}`} />
                        <input 
                          type="file" 
                          onChange={(e) => handleImageUpload(e, loc.id, 'imageUrl', 'locations')} 
                        />
                        {loc.imageUrl && (
                          <button onClick={() => handleDeleteImage(loc.imageUrl, loc.id, 'imageUrl', 'locations')} className="btn-delete">
                            Eliminar Imagen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'leads' && (
          <div className="admin-card data-table-wrapper" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo Electrónico</th>
                  <th>Teléfono</th>
                  <th>Sucursal</th>
                  <th>Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id}>
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>{lead.phone}</td>
                    <td><strong>{lead.location}</strong></td>
                    <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}