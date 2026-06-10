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
      const res = await fetch('/api/media?type=all');
      const result = await res.json();
      if (result.success) setCmsData(result.data);
      
      const leadsRes = await fetch('/api/lead?action=list');
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
      const response = await fetch('/api/media', {
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

  const handleImageUpload = async (e, entityId, targetField, tableName) => {
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

  const menuItems = [
    { id: 'branding', label: 'Identidad y Logo' },
    { id: 'hero', label: 'Sección Hero' },
    { id: 'locations', label: 'Sucursales y Mapas' },
    { id: 'leads', label: 'Prospectos / Leads' }
  ];

  if (loading || !cmsData) return <div className="p-20 text-center font-bold text-[#393939]">Cargando Panel GEO GYM...</div>;

  return (
    <div className="min-h-screen bg-[#ebe8e2] flex">
      <aside className="w-64 bg-[#393939] text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold tracking-widest text-center">GEO <span className="text-[#f64851]">GYM</span></h1>
          <p className="text-xs text-center text-gray-400 mt-1">CMS Control de Ubicaciones</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${activeSection === item.id ? 'bg-[#f64851] text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={() => { localStorage.removeItem('geo_gym_session'); navigate('/login'); }} className="w-full bg-[#f64851]/10 text-[#f64851] hover:bg-[#f64851]/20 py-2 rounded-md transition-colors font-medium border border-[#f64851]/40">Cerrar Sesión</button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10 pb-4 border-b border-gray-300">
          <h2 className="text-3xl font-bold text-[#000000]">{menuItems.find(i => i.id === activeSection)?.label || ''}</h2>
          <div className="flex items-center gap-4">
            {savingStatus && <span className={`text-sm font-medium px-3 py-1 rounded-full ${savingStatus === 'guardado' ? 'bg-green-100 text-green-800' : savingStatus === 'guardando' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
              {savingStatus === 'guardado' ? 'Cambios Guardados' : savingStatus === 'guardando' ? 'Guardando...' : 'Error al guardar'}
            </span>}
            <button onClick={() => { window.location.reload(); }} className="px-5 py-2 bg-white text-[#393939] border border-gray-300 rounded-md hover:bg-gray-50 transition-all font-medium shadow-sm">Recargar Datos</button>
          </div>
        </header>

        {activeSection === 'branding' && (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div>
                <label className="block text-sm font-bold text-[#393939] mb-3">Logo GEO GYM</label>
                <div className="flex items-center gap-6 p-4 border border-gray-200 rounded-lg bg-[#ebe8e2]/20">
                  <img src={cmsData.brandSettings.logoUrl || '/logo-placeholder.png'} alt="Logo CMS" className="h-20 w-auto object-contain p-2 bg-white rounded border" />
                  <div className="flex-1">
                    <input type="file" onChange={(e) => handleImageUpload(e, cmsData.brandSettings.id, 'logoUrl', 'brand_settings')} className="text-sm block w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#f64851]/10 file:text-[#f64851] hover:file:bg-[#f64851]/20 cursor-pointer" />
                    <p className="text-xs text-gray-500 mt-2">Formatos aceptados: PNG, JPG (fondo blanco/transparente)</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#393939] mb-2">Nombre de Marca</label>
                  <input type="text" defaultValue={cmsData.brandSettings.brandName} onBlur={(e) => handleUpdate('brand_settings', 'brandName', e.target.value, cmsData.brandSettings.id)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f64851] focus:border-[#f64851] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#393939] mb-2">Color de Acento Hexadecimal</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg border border-gray-300" style={{ backgroundColor: cmsData.brandSettings.accentColor }}></div>
                    <input type="text" defaultValue={cmsData.brandSettings.accentColor} onBlur={(e) => handleUpdate('brand_settings', 'accentColor', e.target.value, cmsData.brandSettings.id)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f64851] focus:border-[#f64851] transition-all" placeholder="#f64851" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'hero' && (
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#393939] mb-2">Título de la Landing</label>
                  <input type="text" defaultValue={cmsData.hero.title} onBlur={(e) => handleUpdate('hero_settings', 'title', e.target.value, cmsData.hero.id)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f64851] focus:border-[#f64851] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#393939] mb-2">Subtítulo</label>
                  <textarea defaultValue={cmsData.hero.subtitle} onBlur={(e) => handleUpdate('hero_settings', 'subtitle', e.target.value, cmsData.hero.id)} rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f64851] focus:border-[#f64851] transition-all resize-none"></textarea>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#393939] mb-3">Imagen Hero Principal</label>
                <div className="flex flex-col gap-4 border border-gray-200 rounded-lg bg-[#ebe8e2]/20 p-4">
                  <img src={cmsData.hero.imageUrl || '/hero-placeholder.jpg'} alt="Hero CMS" className="w-full h-48 object-cover rounded border" />
                  <input type="file" onChange={(e) => handleImageUpload(e, cmsData.hero.id, 'imageUrl', 'hero_settings')} className="text-sm block w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#f64851]/10 file:text-[#f64851] hover:file:bg-[#f64851]/20 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'locations' && (
          <div className="space-y-10">
            {cmsData.locations.slice(0, 3).map((loc, index) => (
              <div key={loc.id} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-8">
                <header className="pb-4 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-[#000000]">Sucursal {index + 1}: {loc.name}</h3>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#393939] mb-2">Nombre de la Ubicación</label>
                      <input type="text" defaultValue={loc.name} onBlur={(e) => handleUpdate('locations', 'name', e.target.value, loc.id)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f64851] focus:border-[#f64851] transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#393939] mb-2">Dirección Completa</label>
                      <input type="text" defaultValue={loc.address} onBlur={(e) => handleUpdate('locations', 'address', e.target.value, loc.id)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f64851] focus:border-[#f64851] transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-[#393939] mb-2">Precio Mensual</label>
                        <input type="text" defaultValue={loc.price} onBlur={(e) => handleUpdate('locations', 'price', e.target.value, loc.id)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f64851] focus:border-[#f64851] transition-all" placeholder="ej. 99.99" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-[#393939] mb-2">Amenidades (CSV)</label>
                        <input type="text" defaultValue={loc.amenities} onBlur={(e) => handleUpdate('locations', 'amenities', e.target.value, loc.id)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f64851] focus:border-[#f64851] transition-all" placeholder="ej. Piscina, Sauna" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#393939] mb-2">Código de Mapa Embed (iframe)</label>
                      <textarea defaultValue={loc.mapEmbedCode} onBlur={(e) => handleUpdate('locations', 'mapEmbedCode', e.target.value, loc.id)} rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f64851] focus:border-[#f64851] transition-all resize-none text-xs font-mono"></textarea>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-[#393939] mb-3">Imagen de Sucursal</label>
                      <div className="flex flex-col gap-4 border border-gray-200 rounded-lg bg-[#ebe8e2]/20 p-4">
                        <img src={loc.imageUrl || '/location-placeholder.jpg'} alt={`CMS Location ${index}`} className="w-full h-48 object-cover rounded border" />
                        <input type="file" onChange={(e) => handleImageUpload(e, loc.id, 'imageUrl', 'locations')} className="text-sm block w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#f64851]/10 file:text-[#f64851] hover:file:bg-[#f64851]/20 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'leads' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <table className="w-full text-left table-auto">
              <thead className="bg-[#393939] text-white border-b border-gray-600">
                <tr>
                  <th className="p-5 font-semibold">Nombre</th>
                  <th className="p-5 font-semibold">Correo Electrónico</th>
                  <th className="p-5 font-semibold">Teléfono</th>
                  <th className="p-5 font-semibold">Sucursal</th>
                  <th className="p-5 font-semibold">Fecha Registro</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-5 text-[#000000]">{lead.name}</td>
                    <td className="p-5 text-[#393939]">{lead.email}</td>
                    <td className="p-5 text-[#393939]">{lead.phone}</td>
                    <td className="p-5 text-[#000000] font-medium">{lead.location}</td>
                    <td className="p-5 text-[#393939]">{new Date(lead.created_at).toLocaleDateString()}</td>
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