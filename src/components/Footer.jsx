import { Link } from 'react-router-dom';

export default function Footer({ brandSettings, contactSettings }) {
  const brandName = brandSettings?.brandName || 'GEO GYM';
  const description = brandSettings?.description || 'Instalaciones de primer nivel, equipo biomecánico avanzado y un entorno exclusivo diseñado para exigir resultados reales.';
  
  const address = contactSettings?.address || 'Cerro del Pathé 226, Ex Hacienda Santa Ana, 76116 Querétaro, Qro.';
  const phone = contactSettings?.phone || '442 134 7882';
  const schedule = contactSettings?.schedule || 'Lunes a Viernes de 9 AM a 6 PM';
  
  const socialLinks = {
    facebook: contactSettings?.facebook || '#',
    instagram: contactSettings?.instagram || '#'
  };

  const nameParts = brandName.split(' ');
  const firstPart = nameParts[0];
  const secondPart = nameParts.slice(1).join(' ');

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="nav-logo">
              {brandSettings?.logoUrl ? (
                <img src={brandSettings.logoUrl} alt="Logo" className="nav-logo-img" style={{maxHeight:'50px'}}/>
              ) : (
                <>{firstPart} <span>{secondPart}</span></>
              )}
            </Link>
            <p>{description}</p>
            
            {/* Contenedor de íconos sociales actualizados */}
            <div className="social-links-footer" style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-btn fb" aria-label="Facebook">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-btn ig" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
            
          </div>
          
          <div className="footer-links">
            <div>
              <h3>Navegación</h3>
              <ul>
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/sucursales">Sucursales</Link></li>
                <li><Link to="/precios">Planes</Link></li>
              </ul>
            </div>
            <div>
              <h3>Contacto</h3>
              <ul>
                <li>{address}</li>
                <li>Tel: {phone}</li>
                <li>{schedule}</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Parte inferior con el ícono oculto del admin */}
        <div className="footer-bottom" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p>&copy; {new Date().getFullYear()} {brandName}. Todos los derechos reservados.</p>
          
          <Link 
            to="/admin" 
            style={{ position: 'absolute', right: '0', opacity: '0.15', color: 'inherit', padding: '10px', display: 'flex' }}
            aria-label="Acceso Administrativo"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}