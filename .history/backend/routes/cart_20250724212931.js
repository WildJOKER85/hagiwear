// routes/cart.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // подключение к MySQL

// Удаление товара из корзины
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

// Обновление количества товара
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

module.exports = router;
