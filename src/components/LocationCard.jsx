import { Link } from 'react-router-dom';

export default function LocationCard({ location }) {
  const formatText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, index) => {
      if (line.trim() === '') return <br key={index} />;

      if (line.includes('|')) {
        const parts = line.split('|');
        return (
          <div key={index} className="badge-container">
            {parts.map((part, i) => {
              const cleanText = part.replace('•', '').trim();
              const isHighlight = cleanText.includes('Día 1-7') || cleanText.includes('Trimestre') || cleanText.includes('2x1');
              return (
                <span key={i} className={`badge ${isHighlight ? 'badge-highlight' : ''}`}>
                  {cleanText}
                </span>
              );
            })}
          </div>
        );
      }

      if (line.trim().startsWith('•')) {
        return <li key={index} className="list-item">{line.replace('•', '').trim()}</li>;
      }

      return <p key={index} className="text-block">{line}</p>;
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
        <p style={{ fontWeight: '600', color: 'var(--text-black)' }}>
          {location.address}
        </p>
        
        <div className="location-price">
          <h4>Planes Destacados</h4>
          <div className="price-tag">
            {location.price}
          </div>
        </div>

        <div className="location-amenities">
          {formatText(location.amenities)}
        </div>
        
        <Link to="/contacto" className="btn btn-primary btn-block" style={{ marginTop: 'auto' }}>
          Inscribirme en {location.name}
        </Link>
      </div>
    </div>
  );
}