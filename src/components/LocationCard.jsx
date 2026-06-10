import { Link } from 'react-router-dom';

export default function LocationCard({ location }) {
  return (
    <div className="location-card">
      <div className="location-image">
        <img
          src={location.imageUrl || "/default-location.jpg"}
          alt={`Instalaciones en ${location.name}`}
        />
      </div>
      <div className="location-content">
        <h3>{location.name}</h3>
        <p style={{ fontWeight: '600', color: 'var(--text-black)' }}>
          {location.address}
        </p>
        
        <div className="location-price">
          <h4>Planes y Mensualidades</h4>
          <div className="price-tag">
            {location.price}
          </div>
        </div>

        <div 
          className="location-amenities" 
          style={{ 
            whiteSpace: 'pre-wrap', 
            color: 'var(--text-charcoal)', 
            lineHeight: '1.8',
            fontSize: '0.95rem' 
          }}
        >
          {location.amenities}
        </div>
        
        <Link to="/contacto" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
          Inscribirme en {location.name}
        </Link>
      </div>
    </div>
  );
}