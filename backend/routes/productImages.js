const express = require('express');
const router = express.Router();
const db = require('../db');

// Получить изображения по productId
router.get('/:productId/images', async (req, res) => {
   console.log('GET product images for productId:', req.params.productId);
   const { productId } = req.params;

   try {
      const hostUrl = `${req.protocol}://${req.get('host')}/images/`;

      const [rows] = await db.query(
         'SELECT CONCAT(?, image_url) AS image_url FROM product_images WHERE product_id = ? ORDER BY id ASC',
         [hostUrl, productId]
      );

      res.json(rows);
   } catch (err) {
      console.error('Ошибка получения изображений продукта:', err);
      res.status(500).json({ message: 'Ошибка сервера при получении изображений' });
   }
});

module.exports = router;





