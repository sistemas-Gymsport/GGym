import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import PricingTabs from '../components/PricingTabs';
import Footer from '../components/Footer';

export default function Home() {
  const [cmsData, setCmsData] = useState({
    brandSettings: {
      brandName: 'GEO GYM',
      logoUrl: '',
      description: 'Instalaciones de primer nivel, equipo biomecánico advanced y un entorno exclusivo diseñado para exigir resultados reales.',
      accentColor: '#f64851'
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
        const response = await fetch('/api/media?type=all');
        const result = await response.json();
        if (result.success && result.data) {
          setCmsData(prev => ({
            ...prev,
            brandSettings: result.data.brandSettings || prev.brandSettings,
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ success: false, error: null, loading: true });

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Error al procesar el registro');

      setStatus({ success: true, error: null, loading: false });
      setFormData({ name: '', email: '', phone: '', location: '' });
    } catch (err) {
      setStatus({ success: false, error: err.message, loading: false });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#393939]">
      <Navbar brandSettings={cmsData.brandSettings} />
      
      <div id="inicio">
        <Hero 
          title={cmsData.hero.title}
          subtitle={cmsData.hero.subtitle}
          imageUrl={cmsData.hero.imageUrl}
          primaryColor={cmsData.brandSettings.accentColor}
        />
      </div>

      <div id="sucursales" className="border-t border-gray-100 bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-[#000000] sm:text-5xl">
              Sucursales <span className="text-[#f64851]">GEO GYM</span>
            </h2>
            <p className="mt-5 text-xl text-[#393939] max-w-2xl mx-auto">
              Equipamiento avanzado y entorno exclusivo en Querétaro. Encuentra la ubicación perfecta para tus objetivos.
            </p>
          </div>
          <PricingTabs locations={cmsData.locations} accentColor={cmsData.brandSettings.accentColor} />
        </div>
      </div>

      <div id="contacto" className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
            <h2 className="text-3xl font-extrabold text-[#000000] text-center mb-2">
              Comienza tu Entrenamiento de Prueba
            </h2>
            <p className="text-center text-[#393939] mb-8">
              Agenda tu primera sesión sin costo y conoce nuestras instalaciones exclusivas.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#393939]">Nombre Completo</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#f64851] focus:border-transparent transition-all" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#393939]">Correo Electrónico</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#f64851] focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#393939]">Número de Teléfono</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#f64851] focus:border-transparent transition-all" placeholder="ej. 4421234567" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#393939]">Sucursal de Interés</label>
                <select name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#f64851] focus:border-transparent transition-all">
                  <option value="">Selecciona una sucursal</option>
                  {cmsData.locations.map(loc => (
                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                  ))}
                </select>
              </div>

              {status.success && (
                <div className="p-4 bg-green-50 rounded-md text-green-800 text-sm font-medium text-center">
                  ¡Registro exitoso! Un asesor se comunicará contigo pronto.
                </div>
              )}

              {status.error && (
                <div className="p-4 bg-red-50 rounded-md text-red-800 text-sm font-medium text-center">
                  {status.error}
                </div>
              )}

              <div>
                <button type="submit" disabled={status.loading} className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-md text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f64851] transition-all disabled:opacity-50" style={{ backgroundColor: cmsData.brandSettings.accentColor }}>
                  {status.loading ? 'Enviando...' : 'Solicitar Entrenamiento Gratis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer brandSettings={cmsData.brandSettings} contactSettings={cmsData.contactSettings} />
    </div>
  );
}