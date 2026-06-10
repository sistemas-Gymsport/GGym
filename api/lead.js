import { query } from './db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query('SELECT * FROM leads ORDER BY created_at DESC');
      return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, email, phone, location } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const dbQuery = `
        INSERT INTO leads (name, email, phone, location, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `;
      const result = await query(dbQuery, [name, email, phone, location]);
      return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}