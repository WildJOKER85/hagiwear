const express = require('express');
const router = express.Router();
const db = require('../db'); // путь к базе может отличаться

router.get('/:productId', async (req, res) => {
   try {
      const { productId } = req.params;

      const [stockRows] = await db.query(`
         SELECT 
            psn.id,
            psn.product_id,
            psn.color_id,
            c.name AS color_name,
            psn.size_id,
            s.name AS size_name,
            psn.quantity
         FROM product_stock_new psn
         LEFT JOIN colors c ON psn.color_id = c.id
         LEFT JOIN sizes s ON psn.size_id = s.id
         WHERE psn.product_id = ?
      `, [productId]);

      res.json(stockRows);
   } catch (error) {
      console.error('Ошибка получения остатков:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении остатков' });
   }
});

module.exports = router;
