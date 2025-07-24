const express = require('express');
const router = express.Router();
const db = require('../db');

// Получить корзину по userId
router.get('/:userId', async (req, res) => {
   const { userId } = req.params;

   try {
      const [cartItems] = await db.query(
         `SELECT 
            c.id AS cartItemId,
            c.product_id,
            p.name,
            p.price,
            c.size,
            c.quantity,
            (
              SELECT CONCAT(?, pi.image_url)
              FROM product_images pi
              WHERE pi.product_id = p.id AND pi.image_url LIKE '%main.jpg'
              LIMIT 1
            ) AS main_image
         FROM cart c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = ?`,
         [req.hostUrl, userId]
      );

      res.json(cartItems);
   } catch (error) {
      console.error('Ошибка получения корзины:', error);
      res.status(500).json({ error: 'Ошибка получения корзины' });
   }
});

// Проверка остатков
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

// ✅ Обновить количество
router.patch('/update-quantity', async (req, res) => {
   const { userId, productId, size, quantity } = req.body;

   try {
      await db.query(
         'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ? AND size = ?',
         [quantity, userId, productId, size]
      );
      res.json({ message: 'Количество обновлено' });
   } catch (error) {
      console.error('Ошибка обновления количества:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
   }
});

// ✅ Удалить позицию из корзины
router.delete('/:userId/:productId/:size', async (req, res) => {
   const { userId, productId, size } = req.params;

   try {
      await db.query(
         'DELETE FROM cart WHERE user_id = ? AND product_id = ? AND size = ?',
         [userId, productId, size]
      );
      res.json({ message: 'Удалено из корзины' });
   } catch (error) {
      console.error('Ошибка удаления из корзины:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
   }
});

module.exports = router;
