const express = require('express');
const router = express.Router();
const db = require('../db');

// Получить корзину по userId
router.get('/:userId', async (req, res) => {
   const { userId } = req.params;

   try {
      const [rows] = await db.query(
         `SELECT * FROM cart WHERE user_id = ?`,
         [userId]
      );

      res.json(rows);
   } catch (error) {
      console.error('Ошибка получения корзины:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении корзины' });
   }
});

// Проверить наличие товаров
router.post('/check-stock', async (req, res) => {
   const { items } = req.body;

   if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items array' });
   }

   try {
      const results = [];

      for (const item of items) {
         const { productId, size, quantity } = item;

         const [rows] = await db.query(
            'SELECT quantity FROM product_sizes WHERE product_id = ? AND size = ?',
            [productId, size]
         );

         const availableQty = rows.length ? rows[0].quantity : 0;

         results.push({
            productId,
            size,
            requestedQuantity: quantity,
            availableQuantity: availableQty,
            isAvailable: availableQty >= quantity,
         });
      }

      res.json({ items: results });
   } catch (error) {
      console.error('Ошибка проверки остатков:', error);
      res.status(500).json({ error: 'Server error' });
   }
});

module.exports = router;
