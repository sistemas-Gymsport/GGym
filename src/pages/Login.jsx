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
    <div className="login-wrapper">
      <div className="login-header">
        <h2 className="title-main">
          GEO <span>GYM</span>
        </h2>
        <p className="subtitle">
          CMS Interno - Panel de Control Organizacional
        </p>
      </div>

      <div className="login-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Usuario Administrador
            </label>
            <input
              name="username"
              type="text"
              required
              value={credentials.username}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              value={credentials.password}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {error && (
            <div className="status-message status-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
          >
            {loading ? 'Verificando...' : 'Ingresar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}