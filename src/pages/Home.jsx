import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import PricingTabs from '../components/PricingTabs';
import Footer from '../components/Footer';

export default function Home() {
  const locationPath = useLocation();

  const [cmsData, setCmsData] = useState({
    brandSettings: {
      brandName: 'GEO GYM',
      logoUrl: '',
      description: 'Instalaciones de primer nivel, equipo biomecánico avanzado y un entorno exclusivo diseñado para exigir resultados reales.',
      accentColor: '#f64851',
      bgCremita: '#ebe8e2',
      bgWhite: '#ffffff',
      textCharcoal: '#393939',
      textBlack: '#000000',
      borderColor: '#d1cec7'
    },
    contactSettings: {
      address: 'Calle del Pathé 226, Ex Hacienda Santa Ana, 76116 Querétaro, Qro.',
      phone: '442 709 8000',
      schedule: 'Lunes a Viernes: 9 AM a 6 PM'
    },
    hero: {
      title: 'Alcanza tu mejor versión en',
      subtitle: 'Instalaciones de lujo, equipo biomecánico avanzado y un entorno diseñado para resultados reales.',
      imageUrl: ''
    },
    locations: []
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });

  const [status, setStatus] = useState({ success: false, error: null, loading: false });

  useEffect(() => {
    async function loadPageData() {
      try {
        const response = await fetch('/api/cms');
        const result = await response.json();
        if (result.success && result.data) {
          setCmsData(prev => ({
            ...prev,
            brandSettings: { ...prev.brandSettings, ...result.data.brandSettings },
            contactSettings: result.data.contactSettings || prev.contactSettings,
            hero: result.data.hero || prev.hero,
            locations: result.data.locations || []
          }));
        }
      } catch (err) {
        setStatus(prev => ({ ...prev, error: err.message }));
      }
    }
    loadPageData();
  }, []);

  useEffect(() => {
    if (cmsData.brandSettings) {
       document.documentElement.style.setProperty('--brand-coral', cmsData.brandSettings.accentColor);
       document.documentElement.style.setProperty('--bg-cremita', cmsData.brandSettings.bgCremita);
       document.documentElement.style.setProperty('--bg-white', cmsData.brandSettings.bgWhite);
       document.documentElement.style.setProperty('--text-charcoal', cmsData.brandSettings.textCharcoal);
       document.documentElement.style.setProperty('--text-black', cmsData.brandSettings.textBlack);
       document.documentElement.style.setProperty('--border-color', cmsData.brandSettings.borderColor);
    }
  }, [cmsData.brandSettings]);

  useEffect(() => {
    if (locationPath.pathname === '/sucursales') {
      document.getElementById('sucursales')?.scrollIntoView({ behavior: 'smooth' });
    } else if (locationPath.pathname === '/ofertas') {
      document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' });
    } else if (locationPath.pathname === '/precios' || locationPath.pathname === '/contacto') {
      document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [locationPath]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ success: false, error: null, loading: true });

    if (!formData.location) {
      setStatus({ success: false, error: 'Por favor selecciona una sucursal de interés.', loading: false });
      return;
    }

    try {
      const selectedLoc = cmsData.locations.find(loc => loc.name === formData.location);
      let waNumber = null;

      if (selectedLoc && selectedLoc.amenities) {
        const lines = selectedLoc.amenities.split('\n');
        for (let line of lines) {
          if (line.toLowerCase().includes('whatsapp')) {
            const cleanNumber = line.replace(/\D/g, '');
            if (cleanNumber) {
              waNumber = cleanNumber.length === 10 ? `52${cleanNumber}` : cleanNumber;
            }
            break;
          }
        }
      }

      if (!waNumber) {
        const fallbackNumber = cmsData.contactSettings.phone.replace(/\D/g, '');
        waNumber = fallbackNumber.length === 10 ? `52${fallbackNumber}` : fallbackNumber;
      }

      const message = `Solicitud de entrenamiento de prueba.
Datos del interesado:
- Nombre: ${formData.name}
- Correo: ${formData.email}
- Teléfono: ${formData.phone}
- Sucursal de interés: ${formData.location}

Quedo a la espera de su informacion más a detalle.`;
      const encodedMessage = encodeURIComponent(message);

      window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');

      setStatus({ success: true, error: null, loading: false });
      setFormData({ name: '', email: '', phone: '', location: '' });
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false }));
      }, 5000);

    } catch (err) {
      setStatus({ success: false, error: 'Hubo un error al preparar tu solicitud. Intenta de nuevo.', loading: false });
    }
  };

  return (
    <>
      <Navbar brandSettings={cmsData.brandSettings} />
      
      <section className="section-white" id="inicio">
        <Hero 
          title={cmsData.hero.title}
          subtitle={cmsData.hero.subtitle}
          imageUrl={cmsData.hero.imageUrl}
        />
      </section>

      <section className="section section-cremita" id="sucursales">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Sucursales <span>GEO GYM</span>
            </h2>
            <p className="subtitle">
              Equipamiento avanzado y entorno exclusivo en Querétaro. Encuentra la ubicación perfecta para tus objetivos.
            </p>
          </div>
          <PricingTabs locations={cmsData.locations} />
        </div>
      </section>

      <section className="section section-white" id="ofertas">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Ofertas <span>Especiales</span>
            </h2>
            <p className="subtitle">
              Aprovecha nuestras promociones exclusivas por tiempo limitado para alcanzar tus objetivos con el mejor equipamiento.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="form-card" style={{ margin: '0', padding: '2.5rem', borderLeft: '4px solid var(--brand-coral)', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'space-between' }}>
              <div>
                <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800', color: 'var(--brand-coral)', letterSpacing: '1.5px', display: 'block', marginBottom: '0.5rem' }}>Preventa Exclusiva</span>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-black)', fontWeight: '800', marginBottom: '0.5rem' }}>Membresía Fundadora</h3>
                <p style={{ color: 'var(--text-charcoal)', fontSize: '0.95rem' }}>Inscripción 100% gratuita y tarifa preferencial vitalicia asegurada para los primeros miembros registrados antes de la gran apertura.</p>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <a href="#contacto" className="btn btn-primary btn-block" style={{ fontSize: '0.95rem', padding: '0.75rem' }}>
                  Cotizar Membresía
                </a>
              </div>
            </div>
            <div className="form-card" style={{ margin: '0', padding: '2.5rem', borderLeft: '4px solid var(--text-black)', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'space-between' }}>
              <div>
                <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-charcoal)', letterSpacing: '1.5px', display: 'block', marginBottom: '0.5rem' }}>Pase de Cortesía</span>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-black)', fontWeight: '800', marginBottom: '0.5rem' }}>Entrenamiento de Prueba</h3>
                <p style={{ color: 'var(--text-charcoal)', fontSize: '0.95rem' }}>Obtén un acceso de un día completo para conocer de primera mano nuestras instalaciones de lujo y equipamiento biomecánico avanzado.</p>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <a href="#contacto" className="btn btn-secondary btn-block" style={{ fontSize: '0.95rem', padding: '0.75rem', border: '1px solid var(--border-color)' }}>
                  Solicitar Pase Gratis
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-cremita" id="contacto">
        <div className="container">
          <div className="form-card">
            <div className="section-header" style={{ marginBottom: '2rem' }}>
              <h2 className="section-title">Comienza tu Entrenamiento de Prueba</h2>
              <p className="subtitle" style={{ margin: '0 auto' }}>
                Agenda tu primera sesión sin costo y conoce nuestras instalaciones exclusivas.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Nombre Completo</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="form-input" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="form-input" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Número de Teléfono</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    required
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="form-input" 
                    placeholder="ej. 4421234567" 
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Sucursal de Interés</label>
                  <select 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    className="form-input"
                    required
                  >
                    <option value="">Selecciona una sucursal</option>
                    {cmsData.locations.map(loc => (
                      <option key={loc.id} value={loc.name}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {status.success && (
                <div className="status-message status-success">
                  ¡Te estamos redirigiendo a WhatsApp de manera segura!
                </div>
              )}

              {status.error && (
                <div className="status-message status-error">
                  {status.error}
                </div>
              )}

              <button type="submit" disabled={status.loading} className="btn btn-primary btn-block">
                {status.loading ? 'Redirigiendo...' : 'Solicitar Entrenamiento Gratis (WhatsApp)'}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer brandSettings={cmsData.brandSettings} contactSettings={cmsData.contactSettings} />
    </>
  );
}