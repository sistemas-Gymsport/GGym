import React, { useState, useEffect, useId } from 'react';
import { useNavigate } from 'react-router-dom';

const defaultColors = {
  accentColor: '#f64851',
  bgCremita: '#ebe8e2',
  bgWhite: '#ffffff',
  textCharcoal: '#393939',
  textBlack: '#000000',
  borderColor: '#d1cec7'
};

const ImageDropzone = ({ currentImage, onUpload, onRemove, placeholderText }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const inputId = useId();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/webp', 0.8);
        setPreview(compressedDataUrl);
        setPendingFile(compressedDataUrl);
      };
    };
  };

  const handleSave = () => {
    if (pendingFile) {
      onUpload(pendingFile);
    }
    setPendingFile(null);
    setPreview(null);
  };

  const handleDiscard = () => {
    setPendingFile(null);
    setPreview(null);
  };

  return (
    <div 
      className={`drag-drop-zone ${dragActive ? 'active' : ''}`} 
      onDragEnter={handleDrag} 
      onDragLeave={handleDrag} 
      onDragOver={handleDrag} 
      onDrop={handleDrop}
    >
      <div className="image-preview-container">
        <img src={preview || currentImage || '/placeholder.jpg'} alt="Vista Previa" />
      </div>
      
      {!pendingFile ? (
        <div className="upload-controls">
          <p>{placeholderText || 'Arrastra tu nueva imagen aquí'}</p>
          <input 
            type="file" 
            id={inputId} 
            onChange={handleChange} 
            accept="image/*"
            style={{ display: 'none' }}
          />
          <label htmlFor={inputId} className="btn btn-outline" style={{ cursor: 'pointer' }}>
            Seleccionar archivo
          </label>
          {currentImage && (
            <button onClick={onRemove} className="btn-delete" style={{ marginTop: '0.5rem' }}>
              Eliminar Imagen Actual
            </button>
          )}
        </div>
      ) : (
        <div className="action-controls" style={{ display: 'flex', gap: '1rem', marginTop: '1rem', width: '100%' }}>
          <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1 }}>
            Guardar Cambios
          </button>
          <button onClick={handleDiscard} className="btn btn-secondary" style={{ flex: 1 }}>
            Descartar
          </button>
        </div>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [cmsData, setCmsData] = useState({
    brandSettings: { id: 1, brandName: '', logoUrl: '', accentColor: '#f64851', bgCremita: '#ebe8e2', bgWhite: '#ffffff', textCharcoal: '#393939', textBlack: '#000000', borderColor: '#d1cec7' },
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

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('geo_gym_session');
    if (!session) navigate('/login');
    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    if (cmsData.brandSettings) {
       document.documentElement.style.setProperty('--brand-coral', cmsData.brandSettings.accentColor || defaultColors.accentColor);
       document.documentElement.style.setProperty('--bg-cremita', cmsData.brandSettings.bgCremita || defaultColors.bgCremita);
       document.documentElement.style.setProperty('--bg-white', cmsData.brandSettings.bgWhite || defaultColors.bgWhite);
       document.documentElement.style.setProperty('--text-charcoal', cmsData.brandSettings.textCharcoal || defaultColors.textCharcoal);
       document.documentElement.style.setProperty('--text-black', cmsData.brandSettings.textBlack || defaultColors.textBlack);
       document.documentElement.style.setProperty('--border-color', cmsData.brandSettings.borderColor || defaultColors.borderColor);
    }
  }, [cmsData.brandSettings]);

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

  const getStateKey = (tableName) => {
    if (tableName === 'brand_settings') return 'brandSettings';
    if (tableName === 'hero_settings') return 'hero';
    return tableName;
  };

  const handleUpdate = async (tableName, targetField, value, entityId) => {
    setSavingStatus('guardando texto...');
    const stateKey = getStateKey(tableName);

    setCmsData(prev => ({
      ...prev,
      [stateKey]: stateKey === 'locations'
        ? prev.locations.map(loc => loc.id === entityId ? { ...loc, [targetField]: value } : loc)
        : { ...prev[stateKey], [targetField]: value }
    }));

    try {
      const response = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, targetField, value, entityId, action: 'update_text' })
      });
      const result = await response.json();
      if (result.success) {
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

  const handleColorChange = (key, value) => {
    setCmsData(prev => ({
      ...prev,
      brandSettings: { ...prev.brandSettings, [key]: value }
    }));
  };

  const confirmResetColors = async () => {
    setShowResetConfirm(false);
    setSavingStatus('restableciendo colores...');
    try {
      await Promise.all(
        Object.entries(defaultColors).map(([key, value]) =>
          fetch('/api/cms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableName: 'brand_settings', targetField: key, value, entityId: cmsData.brandSettings.id, action: 'update_text' })
          })
        )
      );
      
      setCmsData(prev => ({
        ...prev,
        brandSettings: { ...prev.brandSettings, ...defaultColors }
      }));
      setSavingStatus('colores restablecidos');
      setTimeout(() => setSavingStatus(null), 2000);
    } catch (err) {
      setSavingStatus('error');
      setTimeout(() => setSavingStatus(null), 2500);
    }
  };

  const handleAddLocation = async () => {
    setSavingStatus('creando...');
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
    setSavingStatus('eliminando...');
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

  const handleImageUploadConfirm = async (dataUrl, entityId, targetField, tableName) => {
    setSavingStatus('subiendo a Cloudinary...');
    try {
      const response = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: dataUrl, entityId, targetField, tableName })
      });
      
      if (!response.ok) {
        throw new Error('Error de servidor');
      }

      const result = await response.json();
      if (result.success) {
        const stateKey = getStateKey(tableName);
        if (stateKey === 'locations' && editingLoc && editingLoc.id === entityId) {
          setEditingLoc(prev => ({ ...prev, [targetField]: result.url }));
        }
        setCmsData(prev => ({
          ...prev,
          [stateKey]: stateKey === 'locations'
            ? prev.locations.map(loc => loc.id === entityId ? { ...loc, [targetField]: result.url } : loc)
            : { ...prev[stateKey], [targetField]: result.url }
        }));
        setSavingStatus('imagen subida');
        setTimeout(() => setSavingStatus(null), 2000);
      } else {
        throw new Error(result.error || 'Error subida');
      }
    } catch (err) {
      console.error(err);
      setSavingStatus('error subiendo imagen');
      setTimeout(() => setSavingStatus(null), 3000);
    }
  };

  const handleDeleteImage = async (url, entityId, targetField, tableName) => {
    if (!url) return;
    if (!window.confirm('¿Seguro que deseas eliminar esta imagen de forma permanente?')) return;
    
    setSavingStatus('eliminando de Cloudinary...');
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
        const stateKey = getStateKey(tableName);
        if (stateKey === 'locations' && editingLoc && editingLoc.id === entityId) {
          setEditingLoc(prev => ({ ...prev, [targetField]: '' }));
        }
        setCmsData(prev => ({
          ...prev,
          [stateKey]: stateKey === 'locations'
            ? prev.locations.map(loc => loc.id === entityId ? { ...loc, [targetField]: '' } : loc)
            : { ...prev[stateKey], [targetField]: '' }
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
    setSavingStatus('guardando...');
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
    if (!window.confirm('Esta acción eliminará el registro permanentemente. ¿Confirmar?')) return;
    
    setSavingStatus('eliminando...');
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
    { id: 'dashboard', label: 'Resumen / Dashboard' },
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
              <span className={`status-message ${savingStatus.includes('guardado') || savingStatus.includes('subida') || savingStatus.includes('restablecidos') ? 'status-success' : 'status-error'}`} style={{ margin: 0, padding: '0.5rem 1rem' }}>
                {savingStatus.toUpperCase()}
              </span>
            )}
            <button onClick={() => { window.location.reload(); }} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              Recargar Datos
            </button>
          </div>
        </header>

        {activeSection === 'dashboard' && (
          <div>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Total Sucursales</h3>
                <p>{cmsData.locations.length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Prospectos</h3>
                <p>{leads.length}</p>
              </div>
              <div className="stat-card">
                <h3>Último Prospecto Registrado</h3>
                <p style={{ fontSize: '1.5rem', marginTop: '1rem' }}>{leads[0]?.name || 'Sin registros'}</p>
              </div>
            </div>
            
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Prospectos Recientes</h3>
              </div>
              <div className="data-table-wrapper" style={{ border: 'none' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Teléfono</th>
                      <th>Sucursal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.slice(0, 5).map(lead => (
                      <tr key={lead.id}>
                        <td><strong>{lead.name}</strong></td>
                        <td>{lead.phone}</td>
                        <td>{lead.location}</td>
                      </tr>
                    ))}
                    {leads.length === 0 && (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center' }}>No hay prospectos recientes.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'branding' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Ajustes de Identidad Visual</h3>
              <p style={{ color: 'var(--text-charcoal)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Haz clic en el cuadro de color para abrir la paleta. Los cambios se guardan al hacer clic fuera del campo.
              </p>
            </div>
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
                  <label className="form-label">Paleta de Colores</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {[
                      { key: 'accentColor', label: 'Color de Acento (Primario)', default: defaultColors.accentColor },
                      { key: 'bgCremita', label: 'Fondo Secundario', default: defaultColors.bgCremita },
                      { key: 'bgWhite', label: 'Fondo Principal (Tarjetas)', default: defaultColors.bgWhite },
                      { key: 'textCharcoal', label: 'Texto Secundario', default: defaultColors.textCharcoal },
                      { key: 'textBlack', label: 'Texto Principal', default: defaultColors.textBlack },
                      { key: 'borderColor', label: 'Líneas y Bordes', default: defaultColors.borderColor }
                    ].map(color => (
                      <div key={color.key} className="color-picker-wrapper">
                        <input
                          type="color"
                          className="color-input-native"
                          value={cmsData.brandSettings[color.key] || color.default}
                          onChange={(e) => handleColorChange(color.key, e.target.value)}
                          onBlur={(e) => handleUpdate('brand_settings', color.key, e.target.value, cmsData.brandSettings.id)}
                        />
                        <input 
                          type="text" 
                          value={cmsData.brandSettings[color.key] || color.default} 
                          onChange={(e) => handleColorChange(color.key, e.target.value)}
                          onBlur={(e) => handleUpdate('brand_settings', color.key, e.target.value, cmsData.brandSettings.id)} 
                          className="form-input" 
                          placeholder={color.default}
                        />
                      </div>
                    ))}
                    
                  </div>
                  <button onClick={() => setShowResetConfirm(true)} className="btn btn-outline" style={{ marginTop: '1.5rem', width: '100%' }}>
                    Restablecer Colores por Defecto
                  </button>
                </div>
              </div>
              
              <div className="admin-stack">
                <div className="form-group">
                  <label className="form-label">Logo GEO GYM</label>
                  <ImageDropzone 
                    currentImage={cmsData.brandSettings.logoUrl}
                    onUpload={(dataUrl) => handleImageUploadConfirm(dataUrl, cmsData.brandSettings.id, 'logoUrl', 'brand_settings')}
                    onRemove={() => handleDeleteImage(cmsData.brandSettings.logoUrl, cmsData.brandSettings.id, 'logoUrl', 'brand_settings')}
                    placeholderText="Arrastra el nuevo logo aquí"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'hero' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Portada Principal (Hero)</h3>
            </div>
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
                  <ImageDropzone 
                    currentImage={cmsData.hero.imageUrl}
                    onUpload={(dataUrl) => handleImageUploadConfirm(dataUrl, cmsData.hero.id, 'imageUrl', 'hero_settings')}
                    onRemove={() => handleDeleteImage(cmsData.hero.imageUrl, cmsData.hero.id, 'imageUrl', 'hero_settings')}
                    placeholderText="Arrastra la imagen Hero aquí"
                  />
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
                      Editar Datos / Imagen
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

      {showResetConfirm && (
        <div className="modal-overlay">
          <div className="modal-content modal-alert">
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem', color: 'var(--brand-coral)' }}>
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h3>¿Restablecer Colores?</h3>
              <p style={{ color: 'var(--text-charcoal)', marginTop: '0.5rem' }}>
                Esta acción restaurará la paleta de colores a sus valores originales. No podrás deshacer este cambio.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowResetConfirm(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button onClick={confirmResetColors} className="btn btn-primary">
                Sí, Restablecer
              </button>
            </div>
          </div>
        </div>
      )}

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
                    <label className="form-label">Amenidades y Descripción</label>
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
                    <ImageDropzone 
                      currentImage={editingLoc.imageUrl}
                      onUpload={(dataUrl) => handleImageUploadConfirm(dataUrl, editingLoc.id, 'imageUrl', 'locations')}
                      onRemove={() => handleDeleteImage(editingLoc.imageUrl, editingLoc.id, 'imageUrl', 'locations')}
                      placeholderText="Arrastra la foto de la sucursal aquí"
                    />
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