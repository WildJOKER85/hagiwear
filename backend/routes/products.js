const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      const dir = path.join(__dirname, '..', 'images', 'products');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
   },
   filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
   },
});
const upload = multer({ storage });

// GET /api/products — получить все товары с изображениями
// Получить все товары с изображениями
router.get('/', async (req, res) => {
   try {
      // Отключаем кэширование
      res.setHeader('Cache-Control', 'no-store');

      // Запрос с подзапросами для изображений
      const [rows] = await db.query(`
      SELECT
        p.id, p.name, p.description, p.price, p.stock,
        p.discount, p.colors, p.sizes, p.created_at,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type = 'main' LIMIT 1) AS main_image,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type = 'thumb1' LIMIT 1) AS thumb1,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type = 'thumb2' LIMIT 1) AS thumb2
      FROM products p
      ORDER BY p.created_at DESC
    `);

      const hostUrl = `${req.protocol}://${req.get('host')}`;

      // Добавляем полный путь к изображениям
      const products = rows.map(product => ({
         ...product,
         main_image: product.main_image ? `${hostUrl}${product.main_image}` : null,
         thumb1: product.thumb1 ? `${hostUrl}${product.thumb1}` : null,
         thumb2: product.thumb2 ? `${hostUrl}${product.thumb2}` : null,
      }));

      res.json(products);
   } catch (error) {
      console.error('Ошибка при получении продуктов:', error);
      res.status(500).json({ error: 'Ошибка при получении продуктов' });
   }
});

// POST /api/products — добавить товар с фото
router.post('/', upload.array('images', 3), async (req, res) => {
   try {
      const { name, description = '', price, stock = 0, discount = 0, colors = '', sizes = '', stockByColorSize = '{}' } = req.body;

      if (!name || !price) {
         return res.status(400).json({ message: 'Обязательные поля: name и price' });
      }

      const priceNum = Number(price);
      const stockNum = Number(stock);
      const discountNum = Number(discount);

      const [result] = await db.execute(
         `INSERT INTO products (name, description, price, stock, discount, colors, sizes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
         [name, description, priceNum, stockNum, discountNum, colors, sizes]
      );
      const newProductId = result.insertId;

      if (req.files && req.files.length > 0) {
         const imageTypes = ['main', 'thumb1', 'thumb2'];

         for (let i = 0; i < req.files.length && i < imageTypes.length; i++) {
            const file = req.files[i];
            const imageUrl = `/images/products/${file.filename}`;
            const imageType = imageTypes[i];

            await db.execute(
               `INSERT INTO product_images (product_id, image_url, image_type) VALUES (?, ?, ?)`,
               [newProductId, imageUrl, imageType]
            );
         }
      }

      const parsedStock = JSON.parse(stockByColorSize);
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

      // Вернуть новый товар с картинками
      const [rows] = await db.query(`
  SELECT
    p.id, p.name, p.description, p.price, p.stock,
    p.discount, p.colors, p.sizes, p.created_at,
    (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type = 'main' LIMIT 1) AS main_image,
    (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type = 'thumb1' LIMIT 1) AS thumb1,
    (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type = 'thumb2' LIMIT 1) AS thumb2
  FROM products p
  ORDER BY p.created_at DESC
`);

      const hostUrl = req.hostUrl || 'http://localhost:10000';

      const products = rows.map(product => ({
         ...product,
         main_image: product.main_image ? hostUrl + product.main_image : null,
         thumb1: product.thumb1 ? hostUrl + product.thumb1 : null,
         thumb2: product.thumb2 ? hostUrl + product.thumb2 : null,
      }));

      res.status(201).json(products);
   } catch (error) {
      console.error('Ошибка добавления товара:', error);
      res.status(500).json({ message: 'Ошибка сервера при добавлении товара' });
   }
});

// PUT /api/products/:id — обновить товар с фото
router.put('/:id', upload.array('images', 3), async (req, res) => {
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
         // Получить старые изображения для удаления файлов
         const [oldImages] = await db.query('SELECT image_url FROM product_images WHERE product_id = ?', [productId]);

         // Удалить записи из product_images
         await db.execute('DELETE FROM product_images WHERE product_id = ?', [productId]);

         // Удалить файлы с диска
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

         const imageTypes = ['main', 'thumb1', 'thumb2'];
         for (let i = 0; i < req.files.length && i < imageTypes.length; i++) {
            const file = req.files[i];
            const imageUrl = `/images/products/${file.filename}`;
            const imageType = imageTypes[i];
            await db.execute(
               `INSERT INTO product_images (product_id, image_url, image_type) VALUES (?, ?, ?)`,
               [productId, imageUrl, imageType]
            );
         }
      }

      // Вернуть обновлённый товар с картинками
      const [rows] = await db.query(
         `SELECT 
         p.id, p.name, p.description, p.price, p.stock,
         p.discount, p.colors, p.sizes, p.created_at,
         (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type = 'main' LIMIT 1) AS main_image,
         (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type = 'thumb1' LIMIT 1) AS thumb1,
         (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type = 'thumb2' LIMIT 1) AS thumb2
       FROM products p
       WHERE p.id = ?`,
         [productId]
      );

      const hostUrl = req.hostUrl || 'http://localhost:10000';
      const product = rows[0];
      if (product) {
         product.main_image = product.main_image ? hostUrl + product.main_image : null;
         product.thumb1 = product.thumb1 ? hostUrl + product.thumb1 : null;
         product.thumb2 = product.thumb2 ? hostUrl + product.thumb2 : null;
      }

      res.json(product);
   } catch (error) {
      console.error('Ошибка обновления товара:', error);
      res.status(500).json({ message: 'Ошибка сервера при обновлении товара' });
   }
});

// DELETE /api/products/:id — удалить товар и связанные изображения
router.delete('/:id', async (req, res) => {
   const productId = Number(req.params.id);

   try {
      // Получаем изображения, чтобы удалить файлы
      const [images] = await db.query('SELECT image_url FROM product_images WHERE product_id = ?', [productId]);

      // Удаляем товар — связанные записи в product_images удалятся каскадно
      const [result] = await db.execute('DELETE FROM products WHERE id = ?', [productId]);

      if (result.affectedRows === 0) {
         return res.status(404).json({ message: 'Товар не найден' });
      }

      // Удаляем файлы изображений с диска
      for (const img of images) {
         const filePath = path.join(__dirname, '..', img.image_url);
         try {
            if (fs.existsSync(filePath)) {
               fs.unlinkSync(filePath);
            }
         } catch (err) {
            console.error('Ошибка при удалении файла:', err);
         }
      }

      res.sendStatus(200);
   } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      res.status(500).json({ message: 'Ошибка сервера при удалении товара' });
   }
});


module.exports = router;
