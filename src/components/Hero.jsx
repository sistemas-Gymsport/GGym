import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero({ title, subtitle, imageUrl }) {
  const fallbackImage = '/hero-placeholder.jpg';

  return (
    <div className="hero">
      <div className="hero-content">
        <h1 className="title-main">
          {title || "Alcanza tu mejor versión en"} <br/>
          <span>GEO GYM</span>
        </h1>
        <p className="subtitle">
          {subtitle || "Instalaciones de lujo, equipo biomecánico avanzado y un entorno diseñado para resultados reales."}
        </p>
        <div className="hero-actions">
          <Link to="/sucursales" className="btn btn-primary">
            Ver sucursales
          </Link>
          <Link to="/precios" className="btn btn-secondary">
            Conoce los planes
          </Link>
        </div>
      </div>
      <img
        className="hero-image"
        src={imageUrl || fallbackImage}
        alt="Instalaciones GEO GYM"
      />
    </div>
  );
}