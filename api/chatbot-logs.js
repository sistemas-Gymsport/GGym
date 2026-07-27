// api/vps-inventory.js
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // La URL de tu Webhook de n8n en el VPS
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_INVENTORY_URL;
    const N8N_API_KEY = process.env.N8N_API_KEY_TEST;

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': N8N_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`n8n responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Retornamos la data al frontend
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from n8n VPS:', error);
    res.status(500).json({ error: 'Internal Server Error connecting to VPS flow' });
  }
}