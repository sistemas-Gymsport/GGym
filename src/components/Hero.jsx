import { Link } from 'react-router-dom';

export default function Hero({ title, subtitle, imageUrl }) {
  // Ajusta la ruta de la imagen si tienes el logo o assets locales
  const fallbackImage = '/ruta-a-tu-imagen-o-logo.jpg'; 

  return (
    <section className="hero">
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
      
      {/* Esta es la mitad derecha en desktop */}
      <img
        className="hero-image"
        src={imageUrl || fallbackImage}
        alt="Instalaciones GEO GYM"
      />
    </section>
  );
} 