const express = require('express');
const router = express.Router();
const db = require('../db');

// Получить товар по ID с main_image и размерами (если есть)
router.get('/:id', async (req, res) => {
   const { id } = req.params;
   try {
      const hostUrl = req.hostUrl;

      const [productRows] = await db.query(
         `SELECT 
         p.id, p.name, p.description, p.price, p.stock, p.created_at,
         (
           SELECT CONCAT(?, pi.image_url)
           FROM product_images pi
           WHERE pi.product_id = p.id AND pi.image_url LIKE '%main.jpg'
           LIMIT 1
         ) AS main_image
       FROM products p
       WHERE p.id = ?`,
         [hostUrl, id]
      );

      if (productRows.length === 0) {
         return res.status(404).json({ message: 'Товар не найден' });
      }

      const product = productRows[0];

      const [sizeRows] = await db.query(
         `SELECT size, quantity FROM product_sizes WHERE product_id = ?`,
         [id]
      );

      const sizes = {};
      sizeRows.forEach(({ size, quantity }) => {
         sizes[size] = quantity;
      });

      product.sizes = sizes;

      res.json(product);
   } catch (error) {
      console.error('Ошибка получения товара:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении товара' });
   }
});

// Получить все товары с main_image
router.get('/', async (req, res) => {
   try {
      const hostUrl = req.hostUrl;

      const [rows] = await db.query(
         `SELECT 
         p.id, p.name, p.description, p.price, p.stock, p.created_at,
         (
           SELECT CONCAT(?, pi.image_url) 
           FROM product_images pi 
           WHERE pi.product_id = p.id AND pi.image_url LIKE '%main.jpg' 
           LIMIT 1
         ) AS main_image
       FROM products p
       ORDER BY p.created_at DESC`,
         [hostUrl]
      );
      res.json(rows);
   } catch (error) {
      console.error('Ошибка получения товаров:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении товаров' });
   }
});

// Добавить товар
router.post('/', async (req, res) => {
   const { name, description, price, stock } = req.body;
   console.log('[POST] Получены данные для добавления:', req.body);
   if (!name || price === undefined) {
      return res.status(400).json({ message: 'Обязательные поля: name и price' });
   }

   try {
      const [result] = await db.execute(
         `INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)`,
         [name, description || '', price, stock || 0]
      );
      console.log('[POST] Результат вставки:', result);

      const [newProductRows] = await db.query('SELECT * FROM products WHERE id = LAST_INSERT_ID()');
      res.status(201).json(newProductRows[0]);
   } catch (error) {
      console.error('Ошибка добавления товара:', error);
      res.status(500).json({ message: 'Ошибка сервера при добавлении товара' });
   }
});

// Удалить товар
router.delete('/:id', async (req, res) => {
   const { id } = req.params;
   console.log('[DELETE] Запрос на удаление товара с id:', id);

   try {
      const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
      console.log('[DELETE] Результат удаления:', result);

      if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Товар не найден' });
      }

      res.json({ message: 'Товар удалён' });
   } catch (error) {
      console.error('Ошибка удаления товара:', error);
      res.status(500).json({ message: 'Ошибка сервера при удалении товара' });
   }
});

// Обновить товар
router.put('/:id', async (req, res) => {
   const { id } = req.params;
   const { name, description, price, stock } = req.body;

   console.log('[PUT] Получены данные для обновления:', { id, name, description, price, stock });

   if (!name || price === undefined) {
      return res.status(400).json({ message: 'Обязательные поля: name и price' });
   }

   try {
      // Логируем цену до обновления
      const [beforeUpdate] = await db.query('SELECT price FROM products WHERE id = ?', [id]);
      console.log('[PUT] Цена до обновления:', beforeUpdate[0]?.price);

      // Выполняем обновление
      const [result] = await db.execute(
         `UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?`,
         [name, description || '', price, stock || 0, id]
      );
      console.log('[PUT] Результат обновления:', result);

      if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Товар не найден' });
      }

      // Логируем цену после обновления
      const [afterUpdate] = await db.query('SELECT price FROM products WHERE id = ?', [id]);
      console.log('[PUT] Цена после обновления:', afterUpdate[0]?.price);

      const hostUrl = req.hostUrl;
      const [updatedRows] = await db.query(
         `SELECT 
         p.id, p.name, p.description, p.price, p.stock, p.created_at,
         (
           SELECT CONCAT(?, pi.image_url) 
           FROM product_images pi 
           WHERE pi.product_id = p.id AND pi.image_url LIKE '%main.jpg' 
           LIMIT 1
         ) AS main_image
       FROM products p
       WHERE p.id = ?`,
         [hostUrl, id]
      );

      res.json(updatedRows[0]);
   } catch (error) {
      console.error('Ошибка обновления товара:', error);
      res.status(500).json({ message: 'Ошибка сервера при обновлении товара' });
   }
});

// Получить информацию о базе
router.get('/dbinfo', async (req, res) => {
   try {
      const [result] = await db.query('SELECT DATABASE() as dbName, @@hostname as host, @@port as port');
      res.json(result[0]);
   } catch (err) {
      console.error('Ошибка получения информации о базе:', err);
      res.status(500).json({ error: err.message });
   }
});

module.exports = router;
