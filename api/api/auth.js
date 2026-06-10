export default async function handler(req, res) {
  // Manejo de peticiones preflight (CORS) necesarias en entornos de producción
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { username, password } = req.body;

    // Validación de acceso al CMS
    if (username === 'admin' && password === 'GeoGym2026') {
      const token = Buffer.from(`${username}-${Date.now()}`).toString('base64');
      return res.status(200).json({ success: true, token });
    }

    return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}