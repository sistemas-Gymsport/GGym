import { Link } from 'react-router-dom';

export default function LocationCard({ location }) {
  const formatText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, index) => {
      let trimmed = line.trim();
      
      if (trimmed === '') {
        return <div key={index} className="location-spacer"></div>;
      }

      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        trimmed = trimmed.substring(1).trim();
      }

      if (trimmed.endsWith(':')) {
         return <h4 key={index} className="location-subheader">{trimmed}</h4>;
      }

      if (trimmed.includes(':') && !trimmed.startsWith('http')) {
        const colonIndex = trimmed.indexOf(':');
        const label = trimmed.substring(0, colonIndex).trim();
        const rest = trimmed.substring(colonIndex + 1).trim();
        
        return (
          <div key={index} className="location-detail-row">
            <span className="detail-label">{label}:</span>
            <span className="detail-value">{rest}</span>
          </div>
        );
      }

      return (
        <div key={index} className="location-list-item">
          <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>{trimmed}</span>
        </div>
      );
    });
  };

  return (
    <div className="location-card-modern">
      <div className="location-image-wrapper">
        <img
          src={location.imageUrl || "/default-location.jpg"}
          alt={`Instalaciones en ${location.name}`}
        />
        <div className="location-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location.name}
        </div>
      </div>
      
      <div className="location-content-modern">
        <div className="location-header">
          <h3>{location.name}</h3>
          <p className="address-text">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location.address}
          </p>
        </div>
        
        <div className="price-highlight-box">
          <span className="price-subtitle">Planes Destacados</span>
          <span className="price-main">{location.price}</span>
        </div>

        <div className="location-info-grid">
          {formatText(location.amenities)}
        </div>

        {location.mapEmbedCode && (
          <div 
            className="location-map-container"
            dangerouslySetInnerHTML={{ __html: location.mapEmbedCode }}
          />
        )}
        
        <Link to="/contacto" className="btn btn-primary btn-block cta-button">
          Inscribirme en {location.name}
        </Link>
      </div>
    </div>
  );
}