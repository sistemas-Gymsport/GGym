import { v2 as cloudinary } from 'cloudinary';
import { query } from './db.js';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { file, entityId, targetField, tableName } = req.body;
      const uploadResponse = await cloudinary.uploader.upload(file, {
        folder: 'gym_cms_assets',
      });
      
      const imageUrl = uploadResponse.secure_url;
      const dbQuery = `UPDATE ${tableName} SET "${targetField}" = $1 WHERE id = $2 RETURNING *`;
      const dbResult = await query(dbQuery, [imageUrl, entityId]);
      
      return res.status(200).json({ success: true, url: imageUrl, data: dbResult.rows[0] });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { publicId, entityId, targetField, tableName } = req.body;
      await cloudinary.uploader.destroy(publicId);
      
      const dbQuery = `UPDATE ${tableName} SET "${targetField}" = NULL WHERE id = $1 RETURNING *`;
      const dbResult = await query(dbQuery, [entityId]);
      
      return res.status(200).json({ success: true, data: dbResult.rows[0] });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}