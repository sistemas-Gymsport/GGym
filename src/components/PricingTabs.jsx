import { useState } from 'react';
import LocationCard from './LocationCard';

export default function PricingTabs({ locations }) {
  const [activeTab, setActiveTab] = useState(locations?.[0]?.id || null);

  if (!locations || locations.length === 0) {
    return (
      <div className="py-12 bg-[#ebe8e2] text-center">
        <p className="text-[#393939] text-lg">No hay sucursales disponibles en este momento.</p>
      </div>
    );
  }

  const activeLocation = locations.find(loc => loc.id === activeTab);

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[#000000] sm:text-4xl">
            Nuestras Sucursales
          </h2>
          <p className="mt-4 text-xl text-[#393939]">
            Encuentra tu GEO GYM más cercano y comienza a entrenar hoy.
          </p>
        </div>
        <div className="mt-10">
          <div className="flex justify-center border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setActiveTab(location.id)}
                  className={`${
                    activeTab === location.id
                      ? 'border-[#5b21b6] text-[#5b21b6]'
                      : 'border-transparent text-[#393939] hover:text-[#000000] hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
                >
                  {location.name}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-12">
            {activeLocation && <LocationCard location={activeLocation} />}
          </div>
        </div>
      </div>
    </div>
  );
}