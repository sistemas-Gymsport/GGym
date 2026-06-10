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
        <p>{location.address}</p>
        
        <div className="location-price">
          <h4>Membresía Mensual</h4>
          <div className="price-tag">
            ${location.price}
            <span>/mes</span>
          </div>
        </div>

        <ul className="location-amenities">
          {location.amenities && location.amenities.map((amenity, index) => (
            <li key={index}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {amenity}
            </li>
          ))}
        </ul>
        
        <Link to="/contacto" className="btn btn-primary btn-block">
          Inscribirme en {location.name}
        </Link>
      </div>
    </div>
  );
}