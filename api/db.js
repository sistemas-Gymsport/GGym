// Importa tu conexión a la base de datos (ajusta la ruta según tu proyecto)
const db = require('./db.js');

module.exports = function(app) {
  
  // GET: Obtener la configuración actual del footer
  app.get('/api/footer', async (req, res) => {
    try {
      // Ajusta la consulta según el cliente SQL que uses (mysql2, pg, sqlite3, etc.)
      const [rows] = await db.query('SELECT * FROM footer_settings WHERE id = 1');
      
      if (rows && rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.status(404).json({ message: "Configuración no encontrada" });
      }
    } catch (error) {
      console.error("Error obteniendo footer:", error);
      res.status(500).json({ error: "Error del servidor" });
    }
  });

  // POST: Actualizar la configuración del footer
  app.post('/api/footer', async (req, res) => {
    const { 
      bgColor, textColor, accentColor, description, 
      address, phone, email, schedule, 
      facebook, instagram, tiktok 
    } = req.body;

    try {
      const query = `
        UPDATE footer_settings SET 
          bgColor = ?, textColor = ?, accentColor = ?, 
          description = ?, address = ?, phone = ?, 
          email = ?, schedule = ?, facebook = ?, 
          instagram = ?, tiktok = ?
        WHERE id = 1
      `;
      
      const values = [
        bgColor, textColor, accentColor, description, 
        address, phone, email, schedule, 
        facebook, instagram, tiktok
      ];

      await db.query(query, values);
      res.json({ message: "Footer actualizado correctamente" });
      
    } catch (error) {
      console.error("Error actualizando footer:", error);
      res.status(500).json({ error: "Error del servidor al actualizar" });
    }
  });

};