import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'auth',
          username: credentials.username,
          password: credentials.password
        })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Credenciales incorrectas');

      localStorage.setItem('geo_gym_session', result.token);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ebe8e2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-[#000000] tracking-wider">
          GEO <span className="text-[#5b21b6]">GYM</span>
        </h2>
        <p className="mt-2 text-center text-sm text-[#393939]">
          CMS Interno - Panel de Control Organizacional
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-[#393939]">
                Usuario Administrador
              </label>
              <div className="mt-1">
                <input
                  name="username"
                  type="text"
                  required
                  value={credentials.username}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-[#000000] placeholder-gray-400 focus:outline-none focus:ring-[#5b21b6] focus:border-[#5b21b6] sm:text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#393939]">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  name="password"
                  type="password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-[#000000] placeholder-gray-400 focus:outline-none focus:ring-[#5b21b6] focus:border-[#5b21b6] sm:text-sm transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 rounded-md text-red-700 text-sm font-medium text-center">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-sm font-medium text-white bg-[#393939] hover:bg-[#000000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5b21b6] transition-all disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Ingresar al Panel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}