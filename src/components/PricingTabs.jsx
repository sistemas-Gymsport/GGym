import { useState } from 'react';
import LocationCard from './LocationCard';

export default function PricingTabs({ locations }) {
  const [activeTab, setActiveTab] = useState(locations?.[0]?.id || null);

  if (!locations || locations.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>No hay sucursales disponibles en este momento.</p>
      </div>
    );
  }

  const activeLocation = locations.find(loc => loc.id === activeTab);

  return (
    <div className="pricing-tabs-container">
      <div className="tabs-nav" role="tablist">
        {locations.map((location) => (
          <button
            key={location.id}
            role="tab"
            aria-selected={activeTab === location.id}
            onClick={() => setActiveTab(location.id)}
            className={`tab-btn ${activeTab === location.id ? 'active' : ''}`}
          >
            {/* Ícono de Pin de Mapa */}
            <svg 
              className="tab-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location.name}
          </button>
        ))}
      </div>
      
      <div className="tab-content-wrapper" key={activeTab}>
        {activeLocation && <LocationCard location={activeLocation} />}
      </div>
    </div>
  );
}