import { Link } from 'react-router-dom';

export default function LocationCard({ location }) {
  return (
    <div className="bg-[#ebe8e2] rounded-lg shadow-xl overflow-hidden flex flex-col lg:flex-row">
      <div className="lg:w-2/5 h-64 lg:h-auto">
        <img
          src={location.imageUrl || "/default-location.jpg"}
          alt={`Instalaciones en ${location.name}`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="lg:w-3/5 p-8 lg:p-12 flex flex-col justify-between">
        <div>
          <h3 className="text-3xl font-bold text-[#000000] mb-2">{location.name}</h3>
          <p className="text-[#393939] mb-6">{location.address}</p>
          
          <div className="mb-8">
            <h4 className="text-xl font-semibold text-[#5b21b6] mb-4">Membresía Mensual</h4>
            <div className="flex items-baseline text-5xl font-extrabold text-[#000000]">
              ${location.price}
              <span className="ml-1 text-xl font-medium text-[#393939]">/mes</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            {location.amenities && location.amenities.map((amenity, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-[#5b21b6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="ml-3 text-base text-[#393939]">{amenity}</p>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <Link
            to="/contacto"
            className="block w-full text-center px-6 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-[#393939] hover:bg-[#000000] transition-colors shadow-md"
          >
            Inscribirme en {location.name}
          </Link>
        </div>
      </div>
    </div>
  );
}