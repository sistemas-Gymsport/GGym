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
    contactSettings: { id: 1, address: '', phone: '', schedule: '', facebook: '', instagram: '', footerText: '' },
    hero: { id: 1, title: '', subtitle: '', imageUrl: '' },
    locations: [],
    offers: []
  });
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    step: 1,
    title: '',
    message1: '',
    onConfirm: null
  });

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStateKey = (tableName) => {
    if (tableName === 'brand_settings') return 'brandSettings';
    if (tableName === 'hero_settings') return 'hero';
    if (tableName === 'contact_settings') return 'contactSettings';
    if (tableName === 'offers') return 'offers';
    return tableName;
  };

  const handleUpdate = async (tableName, targetField, value, entityId) => {
    setSavingStatus('guardando texto...');
    const stateKey = getStateKey(tableName);

    setCmsData(prev => ({
      ...prev,
      [stateKey]: stateKey === 'locations' || stateKey === 'offers'
        ? prev[stateKey].map(item => item.id === entityId ? { ...item, [targetField]: value } : item)
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

  const requestDelete = (onConfirm, title, message1) => {
    setConfirmModal({
      isOpen: true,
      step: 1,
      title,
      message1,
      onConfirm
    });
  };

  const confirmResetColors = async () => {
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

  const handleAddOffer = async () => {
    setSavingStatus('creando...');
    try {
      const response = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_offer' })
      });
      const result = await response.json();
      if (result.success) {
        setCmsData(prev => ({
          ...prev,
          offers: [...prev.offers, result.data]
        }));
        setEditingOffer(result.data);
        setIsOfferModalOpen(true);
        setSavingStatus('guardado');
        setTimeout(() => setSavingStatus(null), 1500);
      }
    } catch (err) {
      setSavingStatus('error');
      setTimeout(() => setSavingStatus(null), 2500);
    }
  };

  const handleDeleteOffer = async (id) => {
    setSavingStatus('eliminando...');
    try {
      const response = await fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_offer', entityId: id })
      });
      const result = await response.json();
      if (result.success) {
        setCmsData(prev => ({
          ...prev,
          offers: prev.offers.filter(o => o.id !== id)
        }));
        setSavingStatus('guardado');
        setIsOfferModalOpen(false);
        setTimeout(() => setSavingStatus(null), 1500);
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
        if (stateKey === 'offers' && editingOffer && editingOffer.id === entityId) {
          setEditingOffer(prev => ({ ...prev, [targetField]: result.url }));
        }
        setCmsData(prev => ({
          ...prev,
          [stateKey]: stateKey === 'locations' || stateKey === 'offers'
            ? prev[stateKey].map(item => item.id === entityId ? { ...item, [targetField]: result.url } : item)
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
        if (stateKey === 'offers' && editingOffer && editingOffer.id === entityId) {
          setEditingOffer(prev => ({ ...prev, [targetField]: '' }));
        }
        setCmsData(prev => ({
          ...prev,
          [stateKey]: stateKey === 'locations' || stateKey === 'offers'
            ? prev[stateKey].map(item => item.id === entityId ? { ...item, [targetField]: '' } : item)
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

  const menuItems = [
    { id: 'dashboard', label: 'Resumen / Dashboard' },
    { id: 'branding', label: 'Identidad y Logo' },
    { id: 'hero', label: 'Sección Hero' },
    { id: 'locations', label: 'Sucursales y Mapas' },
    { id: 'offers', label: 'Ofertas y Promociones' },
    { id: 'footer', label: 'Footer y Contacto' },
    { id: 'chatbot', label: 'Registros del Chatbot', isExternalRoute: true, path: '/admin/chatbotgeogym' }
  ];

  if (loading || !cmsData) return <div style={{ padding: '5rem', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>Cargando Panel GEO GYM...</div>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          {cmsData.brandSettings?.logoUrl ? (
            <img src={cmsData.brandSettings.logoUrl} alt="Logo" className="admin-logo-img" />
          ) : (
            <h1>GEO <span>GYM</span></h1>
          )}
        </div>
        <nav className="admin-nav">
          {menuItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => {
                if (item.isExternalRoute) {
                  navigate(item.path);
                } else {
                  setActiveSection(item.id);
                }
              }} 
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
                <h3>Total Ofertas</h3>
                <p>{cmsData.offers?.length || 0}</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'branding' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Ajustes de Identidad Visual</h3>
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

                  <button 
                    onClick={() => requestDelete(confirmResetColors, 'Restablecer Colores', '¿Restaurar la paleta de colores a sus valores originales?')} 
                    className="btn btn-outline" 
                    style={{ marginTop: '1.5rem', width: '100%' }}
                  >
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
                    onRemove={() => requestDelete(() => handleDeleteImage(cmsData.brandSettings.logoUrl, cmsData.brandSettings.id, 'logoUrl', 'brand_settings'), 'Eliminar Logo', '¿Seguro que deseas eliminar el logo de la marca?')}
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
                    onRemove={() => requestDelete(() => handleDeleteImage(cmsData.hero.imageUrl, cmsData.hero.id, 'imageUrl', 'hero_settings'), 'Eliminar Imagen Hero', '¿Seguro que deseas eliminar la imagen principal?')}
                    placeholderText="Arrastra la imagen Hero aquí"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'footer' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Ajustes de Footer y Contacto</h3>
            </div>
            <div className="admin-grid">
              <div className="admin-stack">
                <div className="form-group">
                  <label className="form-label">Dirección Principal</label>
                  <input 
                    type="text" 
                    defaultValue={cmsData.contactSettings?.address || ''} 
                    onBlur={(e) => handleUpdate('contact_settings', 'address', e.target.value, cmsData.contactSettings.id)} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input 
                    type="text" 
                    defaultValue={cmsData.contactSettings?.phone || ''} 
                    onBlur={(e) => handleUpdate('contact_settings', 'phone', e.target.value, cmsData.contactSettings.id)} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Horarios de Atención</label>
                  <input 
                    type="text" 
                    defaultValue={cmsData.contactSettings?.schedule || ''} 
                    onBlur={(e) => handleUpdate('contact_settings', 'schedule', e.target.value, cmsData.contactSettings.id)} 
                    className="form-input" 
                  />
                </div>
              </div>
              <div className="admin-stack">
                <div className="form-group">
                  <label className="form-label">Link de Facebook</label>
                  <input 
                    type="text" 
                    defaultValue={cmsData.contactSettings?.facebook || ''} 
                    onBlur={(e) => handleUpdate('contact_settings', 'facebook', e.target.value, cmsData.contactSettings.id)} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Link de Instagram</label>
                  <input 
                    type="text" 
                    defaultValue={cmsData.contactSettings?.instagram || ''} 
                    onBlur={(e) => handleUpdate('contact_settings', 'instagram', e.target.value, cmsData.contactSettings.id)} 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción Larga del Footer</label>
                  <textarea 
                    defaultValue={cmsData.contactSettings?.footerText || ''} 
                    onBlur={(e) => handleUpdate('contact_settings', 'footerText', e.target.value, cmsData.contactSettings.id)} 
                    className="form-input" 
                    rows={4}
                    style={{ resize: 'vertical' }}
                  ></textarea>
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

        {activeSection === 'offers' && (
          <div>
            <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3>Gestión de Ofertas</h3>
              <button onClick={handleAddOffer} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }}>
                + Añadir Oferta
              </button>
            </div>
            
            <div className="list-grid">
              {cmsData.offers?.map((offer) => (
                <div key={offer.id} className="location-item">
                  <h4>{offer.title}</h4>
                  <p>{offer.description}</p>
                  <div className="location-item-actions">
                    <button onClick={() => { setEditingOffer(offer); setIsOfferModalOpen(true); }} className="btn-edit" style={{ flex: 1 }}>
                      Editar Datos / Imagen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {confirmModal.isOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content modal-alert" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem', color: confirmModal.step === 1 ? '#ff9800' : 'var(--brand-coral)', transition: 'color 0.3s' }}>
                {confirmModal.step === 1 ? (
                   <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                )}
              </div>
              <h3>{confirmModal.step === 1 ? confirmModal.title : '¿Segurísimo?'}</h3>
              <p style={{ color: 'var(--text-charcoal)', marginTop: '0.5rem', minHeight: '3rem' }}>
                {confirmModal.step === 1 
                  ? confirmModal.message1 
                  : 'Esta acción es irreversible y los datos se eliminarán permanentemente. ¿Confirmas la acción?'}
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
              <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="btn btn-secondary">
                Cancelar
              </button>
              {confirmModal.step === 1 ? (
                <button 
                  onClick={() => setConfirmModal({ ...confirmModal, step: 2 })} 
                  className="btn btn-primary" 
                  style={{ backgroundColor: '#ff9800', borderColor: '#ff9800', color: '#fff' }}
                >
                  Sí, Continuar
                </button>
              ) : (
                <button 
                  onClick={() => { confirmModal.onConfirm(); setConfirmModal({ ...confirmModal, isOpen: false }); }} 
                  className="btn btn-primary" 
                  style={{ backgroundColor: 'var(--brand-coral)', borderColor: 'var(--brand-coral)', color: '#fff' }}
                >
                  Sí, Eliminar Definitivamente
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && editingLoc && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Sucursal: {editingLoc.name}</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn-close">×</button>
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
                  <div className="form-group">
                    <label className="form-label">Código Embed de Google Maps (Iframe)</label>
                    <input 
                      type="text" 
                      defaultValue={editingLoc.mapEmbedCode || ''} 
                      onBlur={(e) => {
                        handleUpdate('locations', 'mapEmbedCode', e.target.value, editingLoc.id);
                        setEditingLoc({...editingLoc, mapEmbedCode: e.target.value});
                      }} 
                      className="form-input" 
                      placeholder='<iframe src="https://www.google.com/maps/embed?..." ></iframe>'
                    />
                  </div>
                </div>
                <div className="admin-stack">
                  <div className="form-group">
                    <label className="form-label">Imagen de Sucursal</label>
                    <ImageDropzone 
                      currentImage={editingLoc.imageUrl}
                      onUpload={(dataUrl) => handleImageUploadConfirm(dataUrl, editingLoc.id, 'imageUrl', 'locations')}
                      onRemove={() => requestDelete(() => handleDeleteImage(editingLoc.imageUrl, editingLoc.id, 'imageUrl', 'locations'), 'Eliminar Imagen', '¿Seguro que deseas eliminar la foto de esta sucursal?')}
                      placeholderText="Arrastra la foto de la sucursal aquí"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => requestDelete(() => handleDeleteLocation(editingLoc.id), 'Eliminar Sucursal', '¿Estás seguro de eliminar esta sucursal?')} className="btn-delete">
                Eliminar Sucursal Definitivamente
              </button>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-primary">
                Cerrar y Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {isOfferModalOpen && editingOffer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Editar Oferta: {editingOffer.title}</h3>
              <button onClick={() => setIsOfferModalOpen(false)} className="btn-close">×</button>
            </div>
            <div className="modal-body">
              <div className="admin-grid">
                <div className="admin-stack">
                  <div className="form-group">
                    <label className="form-label">Título de la Oferta</label>
                    <input 
                      type="text" 
                      defaultValue={editingOffer.title} 
                      onBlur={(e) => {
                        handleUpdate('offers', 'title', e.target.value, editingOffer.id);
                        setEditingOffer({...editingOffer, title: e.target.value});
                      }} 
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Descripción Corta</label>
                    <input 
                      type="text" 
                      defaultValue={editingOffer.description} 
                      onBlur={(e) => {
                        handleUpdate('offers', 'description', e.target.value, editingOffer.id);
                        setEditingOffer({...editingOffer, description: e.target.value});
                      }} 
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Detalles Adicionales (Modal)</label>
                    <textarea 
                      defaultValue={editingOffer.details} 
                      onBlur={(e) => {
                        handleUpdate('offers', 'details', e.target.value, editingOffer.id);
                        setEditingOffer({...editingOffer, details: e.target.value});
                      }} 
                      className="form-input" 
                      rows={6}
                    ></textarea>
                  </div>
                </div>
                <div className="admin-stack">
                  <div className="form-group">
                    <label className="form-label">Imagen Horizontal de la Oferta</label>
                    <ImageDropzone 
                      currentImage={editingOffer.imageUrl}
                      onUpload={(dataUrl) => handleImageUploadConfirm(dataUrl, editingOffer.id, 'imageUrl', 'offers')}
                      onRemove={() => requestDelete(() => handleDeleteImage(editingOffer.imageUrl, editingOffer.id, 'imageUrl', 'offers'), 'Eliminar Imagen', '¿Seguro que deseas eliminar la imagen de esta oferta?')}
                      placeholderText="Arrastra la foto horizontal aquí"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => requestDelete(() => handleDeleteOffer(editingOffer.id), 'Eliminar Oferta', '¿Estás seguro de eliminar esta oferta?')} className="btn-delete">
                Eliminar Oferta Definitivamente
              </button>
              <button onClick={() => setIsOfferModalOpen(false)} className="btn btn-primary">
                Cerrar y Guardar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}