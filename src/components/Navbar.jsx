import { Link } from 'react-router-dom';

export default function Navbar({ brandSettings }) {
  const logoUrl = brandSettings?.logoUrl || null;
  const brandName = brandSettings?.brandName || 'GEO GYM';
  const accentColor = brandSettings?.accentColor || '#5b21b6';
  
  const nameParts = brandName.split(' ');
  const firstPart = nameParts[0];
  const secondPart = nameParts.slice(1).join(' ');

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-10 w-auto object-contain" />
              ) : (
                <span className="text-xl font-bold text-[#393939] tracking-wider">
                  {firstPart} <span style={{ color: accentColor }}>{secondPart}</span>
                </span>
              )}
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-[#393939] hover:text-[#000000] font-medium transition-colors">
              Inicio
            </Link>
            <Link to="/sucursales" className="text-[#393939] hover:text-[#000000] font-medium transition-colors">
              Sucursales
            </Link>
            <Link to="/precios" className="text-[#393939] hover:text-[#000000] font-medium transition-colors">
              Planes
            </Link>
            <Link to="/login" className="text-[#393939] hover:text-[#000000] font-medium transition-colors">
              Panel
            </Link>
          </div>
          <div className="flex items-center">
            <Link
              to="/contacto"
              className="text-white px-5 py-2 rounded-md font-medium transition-colors shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              Comenzar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}