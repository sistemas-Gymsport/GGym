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
      const { action, id, name, email, phone, location } = req.body;

      if (action === 'delete') {
        const result = await query('DELETE FROM leads WHERE id = $1 RETURNING *', [id]);
        return res.status(200).json({ success: true, data: result.rows[0] });
      }

      if (action === 'update') {
        const result = await query(
          'UPDATE leads SET name = $1, email = $2, phone = $3, location = $4 WHERE id = $5 RETURNING *',
          [name, email, phone, location, id]
        );
        return res.status(200).json({ success: true, data: result.rows[0] });
      }

      if (!name || !email) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
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