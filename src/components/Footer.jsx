import { Link } from 'react-router-dom';

export default function Footer({ brandSettings, contactSettings }) {
  const logoUrl = brandSettings?.logoUrl || null;
  const brandName = brandSettings?.brandName || 'GEO GYM';
  const description = brandSettings?.description || 'Instalaciones de primer nivel, equipo biomecánico avanzado y un entorno exclusivo diseñado para exigir resultados reales.';
  const accentColor = brandSettings?.accentColor || '#5b21b6';
  
  const address = contactSettings?.address || 'Cerro del Pathé 226, Ex Hacienda Santa Ana, 76116 Querétaro, Qro.';
  const phone = contactSettings?.phone || '442 134 7882';
  const schedule = contactSettings?.schedule || 'Lunes a Viernes de 9 AM a 6 PM';

  const nameParts = brandName.split(' ');
  const firstPart = nameParts[0];
  const secondPart = nameParts.slice(1).join(' ');

  return (
    <footer className="bg-[#000000] border-t border-[#393939]">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-12 w-auto object-contain filter brightness-0 invert" />
              ) : (
                <span className="text-2xl font-bold text-white tracking-wider">
                  {firstPart} <span style={{ color: accentColor }}>{secondPart}</span>
                </span>
              )}
            </Link>
            <p className="text-[#ebe8e2] text-base leading-relaxed">
              {description}
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-[#ebe8e2] tracking-wider uppercase">Navegación</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/" className="text-base text-gray-400 hover:text-white transition-colors">Inicio</Link>
                  </li>
                  <li>
                    <Link to="/sucursales" className="text-base text-gray-400 hover:text-white transition-colors">Sucursales</Link>
                  </li>
                  <li>
                    <Link to="/precios" className="text-base text-gray-400 hover:text-white transition-colors">Planes</Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-base text-gray-400 hover:text-white transition-colors">Panel de Administración</Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-[#ebe8e2] tracking-wider uppercase">Contacto y Horarios</h3>
                <ul className="mt-4 space-y-4">
                  <li className="text-base text-gray-400">
                    {address}
                  </li>
                  <li className="text-base text-gray-400">
                    Tel: {phone}
                  </li>
                  <li className="text-base text-gray-400">
                    {schedule}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-[#393939] pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-gray-400">
            &copy; {new Date().getFullYear()} {brandName}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}