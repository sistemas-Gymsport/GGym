import { query } from './db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const brandRes = await query('SELECT * FROM brand_settings ORDER BY id LIMIT 1');
      const contactRes = await query('SELECT * FROM contact_settings ORDER BY id LIMIT 1');
      const heroRes = await query('SELECT * FROM hero_settings ORDER BY id LIMIT 1');
      const locationsRes = await query('SELECT * FROM locations ORDER BY id');

      return res.status(200).json({
        success: true,
        data: {
          brandSettings: brandRes.rows[0] || {},
          contactSettings: contactRes.rows[0] || {},
          hero: heroRes.rows[0] || {},
          locations: locationsRes.rows || []
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { action, tableName, targetField, value, entityId } = req.body;

      if (action === 'update_text') {
         const dbQuery = `UPDATE ${tableName} SET "${targetField}" = $1 WHERE id = $2 RETURNING *`;
         const result = await query(dbQuery, [value, entityId]);
         return res.status(200).json({ success: true, data: result.rows[0] });
      }

      if (action === 'create_location') {
         const dbQuery = `INSERT INTO locations (name, address, price, amenities, "mapEmbedCode", "imageUrl") VALUES ('Nueva Sucursal', 'Dirección de la sucursal', 'Consultar Planes', 'Amenidades', '', '') RETURNING *`;
         const result = await query(dbQuery);
         return res.status(200).json({ success: true, data: result.rows[0] });
      }

      if (action === 'delete_location') {
         const dbQuery = `DELETE FROM locations WHERE id = $1 RETURNING *`;
         const result = await query(dbQuery, [entityId]);
         return res.status(200).json({ success: true, data: result.rows[0] });
      }
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}