export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
    const N8N_API_KEY = process.env.N8N_API_KEY;
    if (!N8N_WEBHOOK_URL || !N8N_API_KEY) {
      console.error("Faltan variables de entorno en Vercel");
      return res.status(500).json({ error: 'Configuración de servidor incompleta' });
    }

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'chat-geogym-whatsapp': N8N_API_KEY, 
      },
    });

    if (!response.ok) {
      throw new Error(`n8n respondió con estado: ${response.status}`);
    }

    const data = await response.json();
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from n8n VPS:', error);
    res.status(500).json({ error: 'Internal Server Error connecting to VPS flow' });
  }
}