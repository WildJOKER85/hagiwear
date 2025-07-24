const express = require('express');
const router = express.Router();
const db = require('../db');

// Получить все изображения продукта по productId
router.get('/:productId/images', async (req, res) => {
   const { productId } = req.params;
   try {
      const hostUrl = req.protocol + '://' + req.get('host');
      const [rows] = await db.query(
         'SELECT CONCAT(?, image_url) as image_url FROM product_images WHERE product_id = ? ORDER BY id ASC',
         [hostUrl, productId]
      );
      res.json(rows);
   } catch (err) {
      console.error('Ошибка получения изображений продукта:', err);
      res.status(500).json({ message: 'Ошибка сервера при получении изображений' });
   }
});

module.exports = router;



