export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { username, password } = req.body;

    // Credenciales de acceso al CMS
    if (username === 'admin' && password === 'GeoGym2026') {
      // Generación de token de sesión básico
      const token = Buffer.from(`${username}-${Date.now()}`).toString('base64');
      return res.status(200).json({ success: true, token });
    }

    return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}