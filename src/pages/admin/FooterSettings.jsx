import { useState, useEffect } from 'react';
import './FooterSettings.css';

export default function FooterSettings() {
  const [formData, setFormData] = useState({
    bgColor: '#111111',
    textColor: '#ffffff',
    accentColor: '#F64851',
    description: '',
    address: '',
    phone: '',
    email: '',
    schedule: '',
    facebook: '',
    instagram: '',
    tiktok: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const res = await fetch('/api/footer');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setFormData(data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/footer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      alert('Footer actualizado correctamente');
    } catch (error) {
      console.error(error);
      alert('Error al actualizar el footer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-footer-settings">
      <h2>Configuración del Footer</h2>
      <form onSubmit={handleSubmit}>
        <div className="settings-grid">
          
          <div className="settings-section">
            <h3>Diseño y Colores</h3>
            <div className="form-group">
              <label>Color de Fondo</label>
              <div className="color-input-wrapper">
                <input type="color" name="bgColor" value={formData.bgColor} onChange={handleChange} />
                <input type="text" name="bgColor" value={formData.bgColor} onChange={handleChange} className="admin-input" />
              </div>
            </div>
            <div className="form-group">
              <label>Color de Texto</label>
              <div className="color-input-wrapper">
                <input type="color" name="textColor" value={formData.textColor} onChange={handleChange} />
                <input type="text" name="textColor" value={formData.textColor} onChange={handleChange} className="admin-input" />
              </div>
            </div>
            <div className="form-group">
              <label>Color de Acento (Detalles/Botones)</label>
              <div className="color-input-wrapper">
                <input type="color" name="accentColor" value={formData.accentColor} onChange={handleChange} />
                <input type="text" name="accentColor" value={formData.accentColor} onChange={handleChange} className="admin-input" />
              </div>
            </div>
            <div className="form-group">
              <label>Breve Descripción</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="admin-textarea" />
            </div>
          </div>

          <div className="settings-section">
            <h3>Información de Contacto</h3>
            <div className="form-group">
              <label>Dirección</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className="admin-input" />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="admin-input" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="admin-input" />
            </div>
            <div className="form-group">
              <label>Horario General</label>
              <input type="text" name="schedule" value={formData.schedule} onChange={handleChange} className="admin-input" />
            </div>
          </div>

          <div className="settings-section">
            <h3>Redes Sociales</h3>
            <div className="form-group">
              <label>Enlace de Facebook</label>
              <input type="url" name="facebook" value={formData.facebook} onChange={handleChange} className="admin-input" />
            </div>
            <div className="form-group">
              <label>Enlace de Instagram</label>
              <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} className="admin-input" />
            </div>
            <div className="form-group">
              <label>Enlace de TikTok</label>
              <input type="url" name="tiktok" value={formData.tiktok} onChange={handleChange} className="admin-input" />
            </div>
          </div>

        </div>

        <button type="submit" className="admin-submit-btn" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </form>
    </div>
  );
}   