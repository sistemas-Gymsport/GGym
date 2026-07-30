export default async function handler(req, res) {
  try {
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_BRANCHES_URL;
    const N8N_API_KEY = process.env.N8N_API_KEY;

    if (!N8N_WEBHOOK_URL || !N8N_API_KEY) {
      return res.status(500).json({ error: 'Configuracion de servidor incompleta' });
    }

    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'chat-geogym-whatsapp': N8N_API_KEY,
      },
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(N8N_WEBHOOK_URL, options);

    if (!response.ok) {
      throw new Error(`n8n respondio con estado: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error connecting to VPS flow' });
  }
}