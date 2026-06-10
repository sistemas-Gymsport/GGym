import { Link } from 'react-router-dom';

export default function Footer({ brandSettings, contactSettings }) {
  const brandName = brandSettings?.brandName || 'GEO GYM';
  const description = brandSettings?.description || 'Instalaciones de primer nivel, equipo biomecánico avanzado y un entorno exclusivo diseñado para exigir resultados reales.';
  
  const address = contactSettings?.address || 'Cerro del Pathé 226, Ex Hacienda Santa Ana, 76116 Querétaro, Qro.';
  const phone = contactSettings?.phone || '442 134 7882';
  const schedule = contactSettings?.schedule || 'Lunes a Viernes de 9 AM a 6 PM';

  const nameParts = brandName.split(' ');
  const firstPart = nameParts[0];
  const secondPart = nameParts.slice(1).join(' ');

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="nav-logo">
              {firstPart} <span>{secondPart}</span>
            </Link>
            <p>{description}</p>
          </div>
          
          <div className="footer-links">
            <div>
              <h3>Navegación</h3>
              <ul>
                <li><Link to="/">Inicio</Link></li>
                <li><Link to="/sucursales">Sucursales</Link></li>
                <li><Link to="/precios">Planes</Link></li>
                <li><Link to="/admin">Panel de Administración</Link></li>
              </ul>
            </div>
            <div>
              <h3>Contacto y Horarios</h3>
              <ul>
                <li>{address}</li>
                <li>Tel: {phone}</li>
                <li>{schedule}</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {brandName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}