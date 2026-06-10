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
    <div>
      <div className="tabs-nav">
        {locations.map((location) => (
          <button
            key={location.id}
            onClick={() => setActiveTab(location.id)}
            className={`tab-btn ${activeTab === location.id ? 'active' : ''}`}
          >
            {location.name}
          </button>
        ))}
      </div>
      
      {activeLocation && <LocationCard location={activeLocation} />}
    </div>
  );
}