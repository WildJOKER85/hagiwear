const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка multer для загрузки изображений в папку /images/products
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      const dir = path.join(__dirname, '..', 'images', 'products');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
   },
   filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
   },
});

const upload = multer({ storage });

// GET /api/products — получить все товары с main_image
router.get('/', async (req, res) => {
   try {
      const hostUrl = req.hostUrl || 'http://localhost:10000';

      const [rows] = await db.query(
         `SELECT 
            p.id, p.name, p.description, p.price, p.stock,
            p.discount, p.colors, p.sizes, p.created_at,
            (
               SELECT CONCAT(?, pi.image_url)
               FROM product_images pi
               WHERE pi.product_id = p.id
               ORDER BY pi.id ASC
               LIMIT 1
            ) AS main_image
         FROM products p
         ORDER BY p.created_at DESC`,
         [hostUrl]
      );

      res.json(rows);
   } catch (error) {
      console.error('Ошибка получения товаров:', error);
      res.status(500).json({ message: 'Ошибка сервера при получении товаров', error: error.message });
   }
});

// GET /api/products/:id — получить товар по ID
router.get('/:id', async (req, res) => {
   const { id } = req.params;

   try {
      const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);

      if (rows.length === 0) {
         return res.status(404).json({ message: 'Product not found' });
      }

      const product = rows[0];

      product.colors = product.colors ? product.colors.split(',') : [];

      try {
         product.sizes = product.sizes ? JSON.parse(product.sizes) : {};
      } catch {
         product.sizes = {};
      }

      res.json(product);
   } catch (err) {
      console.error('Ошибка при получении товара по ID:', err);
      res.status(500).json({ message: 'Ошибка сервера', error: err.message });
   }
});

// POST /api/products — добавить товар с фото и остатками по цвету/размеру
router.post('/', upload.array('images', 5), async (req, res) => {
   try {
      const {
         name,
         description = '',
         price,
         stock = 0,
         discount = 0,
         colors = '',
         sizes = '',
         stockByColorSize = '{}', // JSON строка, например: {"Белый":{"S":2,"M":4},"Чёрный":{"L":1}}
      } = req.body;

      if (!name || !price) {
         return res.status(400).json({ message: 'Обязательные поля: name и price' });
      }

      const priceNum = Number(price);
      const stockNum = Number(stock);
      const discountNum = Number(discount);

      // 1. Сохраняем товар в таблицу products
      const [result] = await db.execute(
         `INSERT INTO products (name, description, price, stock, discount, colors, sizes)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
         [name, description, priceNum, stockNum, discountNum, colors, sizes]
      );
      const newProductId = result.insertId;

      // 2. Сохраняем изображения в таблицу product_images
      if (req.files && req.files.length > 0) {
         for (const file of req.files) {
            const imageUrl = `/images/products/${file.filename}`;
            await db.execute(
               `INSERT INTO product_images (product_id, image_url) VALUES (?, ?)`,
               [newProductId, imageUrl]
            );
         }
      }

      // 3. Сохраняем остатки по цвету и размеру
      const parsedStock = JSON.parse(stockByColorSize); // JSON -> Object
      for (const color in parsedStock) {
         for (const size in parsedStock[color]) {
            const quantity = Number(parsedStock[color][size]) || 0;
            if (quantity > 0) {
               await db.execute(
                  `INSERT INTO product_stock (product_id, color, size, quantity)
                   VALUES (?, ?, ?, ?)`,
                  [newProductId, color, size, quantity]
               );
            }
         }
      }

      // 4. Возвращаем добавленный товар с main_image
      const hostUrl = req.hostUrl || 'http://localhost:10000';
      const [rows] = await db.query(
         `SELECT 
            p.id, p.name, p.description, p.price, p.stock,
            p.discount, p.colors, p.sizes, p.created_at,
            (
               SELECT CONCAT(?, pi.image_url)
               FROM product_images pi
               WHERE pi.product_id = p.id
               ORDER BY pi.id ASC
               LIMIT 1
            ) AS main_image
          FROM products p
          WHERE p.id = ?`,
         [hostUrl, newProductId]
      );

      res.status(201).json(rows[0]);
   } catch (error) {
      console.error('Ошибка добавления товара:', error);
      res.status(500).json({ message: 'Ошибка сервера при добавлении товара' });
   }
});


// PUT /api/products/:id — обновить товар, возможно с новыми фото
router.put('/:id', upload.array('images', 5), async (req, res) => {
   const productId = Number(req.params.id);

   try {
      const { name, description = '', price, stock = 0, discount = 0, colors = '', sizes = '' } = req.body;

      if (!name || !price) {
         return res.status(400).json({ message: 'Обязательные поля: name и price' });
      }

      const priceNum = Number(price);
      const stockNum = Number(stock);
      const discountNum = Number(discount);

      const [result] = await db.execute(
         `UPDATE products
          SET name = ?, description = ?, price = ?, stock = ?, discount = ?, colors = ?, sizes = ?
          WHERE id = ?`,
         [name, description, priceNum, stockNum, discountNum, colors, sizes, productId]
      );

      if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Товар не найден' });
      }

      if (req.files && req.files.length > 0) {
         // 1. Получаем старые фото для удаления с диска
         const [oldImages] = await db.query('SELECT image_url FROM product_images WHERE product_id = ?', [productId]);

         // 2. Удаляем записи из базы
         await db.execute('DELETE FROM product_images WHERE product_id = ?', [productId]);

         // 3. Удаляем старые файлы (если они есть)
         for (const img of oldImages) {
            const filePath = path.join(__dirname, '..', img.image_url);
            try {
               if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
               }
            } catch (err) {
               console.error('Ошибка при удалении файла:', err);
            }
         }

         // 4. Сохраняем новые изображения
         for (const file of req.files) {
            const imageUrl = `/images/products/${file.filename}`;
            await db.execute(
               `INSERT INTO product_images (product_id, image_url) VALUES (?, ?)`,
               [productId, imageUrl]
            );
         }
      }

      const hostUrl = req.hostUrl || 'http://localhost:10000';

      const [rows] = await db.query(
         `SELECT 
            p.id, p.name, p.description, p.price, p.stock,
            p.discount, p.colors, p.sizes, p.created_at,
            (
               SELECT CONCAT(?, pi.image_url)
               FROM product_images pi
               WHERE pi.product_id = p.id
               ORDER BY pi.id ASC
               LIMIT 1
            ) AS main_image
         FROM products p
         WHERE p.id = ?`,
         [hostUrl, productId]
      );

      res.json(rows[0]);
   } catch (error) {
      console.error('Ошибка обновления товара:', error);
      res.status(500).json({ message: 'Ошибка сервера при обновлении товара' });
   }
});

// DELETE /api/products/:id — удалить товар и его изображения
router.delete('/:id', async (req, res) => {
   const productId = req.params.id;
   try {
      const [images] = await db.query(
         'SELECT image_url FROM product_images WHERE product_id = ?',
         [productId]
      );

      for (const img of images) {
         const filePath = path.join(__dirname, '..', img.image_url);
         if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
         }
      }

      await db.execute('DELETE FROM product_images WHERE product_id = ?', [productId]);
      const [result] = await db.execute('DELETE FROM products WHERE id = ?', [productId]);

      if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Товар не найден' });
      }

      res.json({ message: 'Товар удалён успешно' });
   } catch (error) {
      console.error('Ошибка удаления товара:', error);
      res.status(500).json({ message: 'Ошибка сервера при удалении товара' });
   }
});

module.exports = router;