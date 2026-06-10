import { Link } from 'react-router-dom';

export default function Navbar({ brandSettings }) {
  const brandName = brandSettings?.brandName || 'GEO GYM';
  const nameParts = brandName.split(' ');
  const firstPart = nameParts[0];
  const secondPart = nameParts.slice(1).join(' ');

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-logo">
          {firstPart} <span>{secondPart}</span>
        </Link>
        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/sucursales">Sucursales</Link>
          <Link to="/precios">Planes</Link>
          <Link to="/admin">Panel</Link>
        </div>
        <div className="nav-action">
          <Link to="/contacto" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
            Comenzar
          </Link>
        </div>
      </div>
    </nav>
  );
}