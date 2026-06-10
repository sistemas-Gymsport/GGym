import { Link } from 'react-router-dom';

export default function LocationCard({ location }) {
  const formatText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, index) => {
      const trimmed = line.trim();
      
      if (trimmed === '') {
        return <div key={index} style={{ height: '0.75rem' }}></div>;
      }

      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        return (
          <li key={index} className="list-item" style={{ marginBottom: '0.25rem' }}>
            {trimmed.substring(1).trim()}
          </li>
        );
      }

      if (trimmed.includes(':') && !trimmed.startsWith('http')) {
        const parts = trimmed.split(':');
        const label = parts.shift();
        const rest = parts.join(':');
        return (
          <p key={index} className="text-block" style={{ marginBottom: '0.25rem' }}>
            <strong style={{ color: 'var(--brand-coral)' }}>{label}:</strong>{rest}
          </p>
        );
      }

      return (
        <p key={index} className="text-block" style={{ marginBottom: '0.25rem', fontWeight: '500' }}>
          {trimmed}
        </p>
      );
    });
  };

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
        <p style={{ fontWeight: '600', color: 'var(--text-black)', marginBottom: '1.5rem' }}>
          {location.address}
        </p>
        
        <div className="location-price" style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: 'var(--brand-coral)', fontSize: '1.25rem', marginBottom: '0.25rem' }}>Planes Destacados</h4>
          <div className="price-tag" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-black)' }}>
            {location.price}
          </div>
        </div>

        <div className="location-amenities" style={{ color: 'var(--text-charcoal)', lineHeight: '1.6' }}>
          {formatText(location.amenities)}
        </div>
        
        <Link to="/contacto" className="btn btn-primary btn-block" style={{ marginTop: '2rem' }}>
          Inscribirme en {location.name}
        </Link>
      </div>
    </div>
  );
}