import { Link } from 'react-router-dom';

export default function Hero({ title, subtitle, imageUrl, primaryColor }) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'default_cloud_name';
  const fallbackImage = `https://res.cloudinary.com/${cloudName}/image/upload/v1/gym_cms_assets/hero-placeholder`;

  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 border-r border-gray-100">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-5xl tracking-tight font-extrabold text-[#393939] sm:text-6xl md:text-7xl">
                <span className="block xl:inline">{title || "Alcanza tu mejor versión en"}</span>{' '}
                <span className="block" style={{ color: primaryColor || '#f64851' }}>GEO GYM</span>
              </h1>
              <p className="mt-6 text-base text-[#393939] sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 leading-relaxed">
                {subtitle || "Instalaciones de lujo, equipo biomecánico avanzado y un entorno diseñado para resultados reales."}
              </p>
              <div className="mt-10 sm:mt-12 sm:flex sm:justify-center lg:justify-start gap-4">
                <div className="rounded-md shadow">
                  <Link
                    to="/sucursales"
                    className="w-full flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-md text-white md:py-4 transition-colors"
                    style={{ backgroundColor: primaryColor || '#f64851' }}
                  >
                    Ver sucursales
                  </Link>
                </div>
                <div>
                  <Link
                    to="/precios"
                    className="w-full flex items-center justify-center px-10 py-4 border border-[#ebe8e2] text-lg font-bold rounded-md text-[#393939] bg-[#ebe8e2] hover:bg-[#ebe8e2]/80 transition-colors"
                  >
                    Conoce los planes
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src={imageUrl || fallbackImage}
          alt="Instalaciones GEO GYM"
        />
      </div>
    </div>
  );
}