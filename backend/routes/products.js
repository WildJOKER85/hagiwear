const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');
// const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult, check } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

// --- Multer: настройка ---
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

// -------------------------------------------
// РЕГИСТРАЦИЯ — оставляем, потому что у тебя есть отдельный auth.js,
// но если этот дублирует логику — лучше использовать auth.js,
// и в product.js убрать регистрацию, чтобы не было дублирования.
// Пока оставлю комментарий:

router.post(
   '/register',
   [
      body('name').notEmpty().withMessage('Имя обязательно'),
      body('email').isEmail().withMessage('Укажите корректный email'),
      body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов'),
      body('confirmPassword').custom((value, { req }) => {
         if (value !== req.body.password) {
            throw new Error('Пароли не совпадают');
         }
         return true;
      }),
   ],
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      try {
         const [existingUsers] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

         if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
         }

         const hashedPassword = await bcrypt.hash(password, 10);

         await db.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
         );

         res.status(201).json({ message: 'Регистрация успешна' });
      } catch (err) {
         console.error('Ошибка при регистрации:', err);
         res.status(500).json({ message: 'Ошибка сервера' });
      }
   }
);

// -------------------------------------------
// Защищенный маршрут получения всех продуктов — нужна авторизация,
// но при тестах может мешать. Если хочешь тестировать без токена — 
// закомментируй authMiddleware здесь:

router.get('/admin/products',
   // authMiddleware, // <--- если мешает при тестах — закомментировать
   async (req, res) => {
      try {
         const [rows] = await db.query('SELECT * FROM products_new');
         res.json(rows);
      } catch (err) {
         console.error(err);
         res.status(500).json({ error: 'Սերվերի սխալ (Server error)' });
      }
   }
);

// -------------------------------------------
// Добавление продукта с изображениями —
// авторизация НЕ используется, т.к. у тебя нет authMiddleware,
// но если нужно — можешь добавить authMiddleware для защиты:

router.post('/', upload.array('images', 3), async (req, res) => {
   try {
      const {
         name,
         description,
         price,
         discount,
         color_id,
         size_id,
         quantity
      } = req.body;

      const [result] = await db.query(
         `INSERT INTO products_new (name, description, price, discount) VALUES (?, ?, ?, ?)`,
         [name, description, price, discount]
      );

      const productId = result.insertId;

      // Сохраняем картинки
      const imageTypes = ['main', 'thumb1', 'thumb2'];
      for (let i = 0; i < req.files.length; i++) {
         const file = req.files[i];
         const imageType = imageTypes[i] || 'main'; // fallback
         const imageUrl = `/images/products/${file.filename}`;

         await db.query(
            `INSERT INTO product_images (product_id, image_url, image_type) VALUES(?, ?, ?)`,
            [productId, imageUrl, imageType]
         );
      }

      // ✅ Добавляем цвет, размер и количество в product_stock_new
      if (color_id && size_id && quantity) {
         await db.query(
            `INSERT INTO product_stock_new (product_id, color_id, size_id, quantity) VALUES (?, ?, ?, ?)`,
            [productId, color_id, size_id, quantity]
         );
      }

      res.status(201).json({ message: '✅ Продукт успешно добавлен', productId });
   } catch (err) {
      console.error('Ошибка при добавлении продукта:', err);
      res.status(500).json({ error: 'Ошибка сервера при добавлении продукта' });
   }
});


// -------------------------------------------
// Получение товаров с картинками — публичный роут, без авторизации:

router.get('/', async (req, res) => {
   try {
      res.setHeader('Cache-Control', 'no-store');

      const [rows] = await db.query(`
         SELECT
         p.id, p.name, p.description, p.price, p.discount, p.created_at,
            (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type = 'main' LIMIT 1) AS main_image,
               (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type = 'thumb1' LIMIT 1) AS thumb1,
                  (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type = 'thumb2' LIMIT 1) AS thumb2
        FROM products_new p
        ORDER BY p.created_at DESC
      `);

      const host = `${req.protocol}://${req.get('host')}`;

      function makeFullUrl(imageUrl) {
         if (!imageUrl) return null;
         const cleanPath = imageUrl.replace(/^\/+/, '');
         return `${host}/${cleanPath}`;
      }

      const products = rows.map(p => ({
         ...p,
         main_image: makeFullUrl(p.main_image),
         thumb1: makeFullUrl(p.thumb1),
         thumb2: makeFullUrl(p.thumb2),
      }));

      console.log('Отдаем продукты с картинками:', products.map(p => ({
         id: p.id,
         main_image: p.main_image,
         thumb1: p.thumb1,
         thumb2: p.thumb2,
      })));

      res.json(products);
   } catch (err) {
      console.error('Ошибка при получении товаров:', err);
      res.status(500).json({ error: 'Ошибка при получении товаров' });
   }
});

// -------------------------------------------
// ✅ Добавление товара с изображениями и остатками
// ❌ Авторизация временно отключена
// 🔐 Добавь authMiddleware позже при необходимости

router.post(
   '/products',
   upload.fields([
      { name: 'main_image', maxCount: 1 },
      { name: 'thumb1', maxCount: 1 },
      { name: 'thumb2', maxCount: 1 },
   ]),
   [
      check('name').notEmpty().withMessage('Անունը պարտադիր է'),
      check('price').isFloat({ gt: 0 }).withMessage('Գինը պետք է մեծ լինի 0-ից'),
      // Другие проверки можно добавить по мере надобности
   ],
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         // 🧹 Удаляем загруженные файлы, если валидация не прошла
         if (req.files) {
            Object.values(req.files).flat().forEach(file => fs.unlinkSync(file.path));
         }
         return res.status(400).json({ errors: errors.array() });
      }

      try {
         const { name, price, discount, description } = req.body;

         // ✅ Обработка sizes и quantities из фронта
         let sizes = [];
         let quantities = [];
         try {
            sizes = typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes;
            quantities = typeof req.body.quantities === 'string' ? JSON.parse(req.body.quantities) : req.body.quantities;
         } catch (e) {
            return res.status(400).json({ message: 'Неверный формат sizes или quantities' });
         }

         // ✅ Сначала создаем товар в products_new
         const [result] = await db.execute(
            `INSERT INTO products_new (name, price, discount, description) VALUES (?, ?, ?, ?)`,
            [name, price, discount || 0, description || '']
         );
         const productId = result.insertId;

         // ✅ Загружаем изображения
         const images = [];
         if (req.files.main_image?.[0]) {
            images.push({
               product_id: productId,
               image_url: `/images/products/${req.files.main_image[0].filename}`,
               image_type: 'main',
            });
         }
         if (req.files.thumb1?.[0]) {
            images.push({
               product_id: productId,
               image_url: `/images/products/${req.files.thumb1[0].filename}`,
               image_type: 'thumb1',
            });
         }
         if (req.files.thumb2?.[0]) {
            images.push({
               product_id: productId,
               image_url: `/images/products/${req.files.thumb2[0].filename}`,
               image_type: 'thumb2',
            });
         }
         console.log('Images', images);

         for (const img of images) {
            await db.execute(
               `INSERT INTO product_images (product_id, image_url, image_type) VALUES (?, ?, ?)`,
               [img.product_id, img.image_url, img.image_type]
            );
         }

         // ✅ Обработка остатков товара (размеры и количество)
         const colorId = parseInt(req.body.color_id); // допустим, ты передаешь один color_id

         for (let i = 0; i < sizes.length; i++) {
            const sizeId = sizes[i];
            const quantity = quantities[i] || 0;

            await db.execute(
               `INSERT INTO product_stock_new (product_id, color_id, size_id, quantity) VALUES (?, ?, ?, ?)`,
               [productId, colorId, sizeId, quantity]
            );
         }

         // 🎉 Успешный ответ
         res.status(201).json({ message: 'Товар успешно добавлен', productId });
      } catch (err) {
         console.error('❌ Ошибка добавления товара:', err);

         // 🧹 Удаление файлов при ошибке
         if (req.files) {
            Object.values(req.files).flat().forEach(file => {
               fs.unlink(file.path, err => {
                  if (err) console.error('Ошибка удаления файла:', err);
               });
            });
         }

         res.status(500).json({ message: 'Серверная ошибка при добавлении товара' });
      }
   }
);

// --- DELETE /api/products/:id ---
// Убрана проверка authMiddleware, чтобы не требовать токен при тестах удаления
router.delete('/:id', async (req, res) => {
   const productId = req.params.id;

   try {
      // Получаем все фото данного товара
      const [images] = await db.query('SELECT image_url FROM product_images WHERE product_id = ?', [productId]);

      // Удаляем файлы из папки
      for (const img of images) {
         const relativePath = img.image_url.replace(/^\/+/, '');
         const filePath = path.join(__dirname, '..', relativePath);

         try {
            await fsPromises.access(filePath);
            await fsPromises.unlink(filePath);
            console.log('Удалён файл:', filePath);
         } catch (err) {
            console.error('Ошибка удаления файла:', filePath, err.message);
         }
      }

      // Удаляем записи изображений из БД
      await db.query('DELETE FROM product_images WHERE product_id = ?', [productId]);

      // Удаляем сам товар
      await db.query('DELETE FROM products_new WHERE id = ?', [productId]);

      res.json({ message: 'Товар и все фото удалены' });
   } catch (err) {
      console.error('Ошибка при удалении товара:', err);
      res.status(500).json({ message: 'Ошибка сервера при удалении товара' });
   }
});

// -------------------------------------------
// Остальные руты (colors, sizes, filter, stock) — публичные, без авторизации.
// Если хочешь, можно добавить защиту, но обычно не требуется:
router.get('/colors', async (req, res) => {
   try {
      const [rows] = await db.query('SELECT * FROM colors ORDER BY name ASC');
      res.json(rows);
   } catch (error) {
      console.error('Ошибка при получении цветов:', error);
      res.status(500).json({ error: 'Ошибка сервера при получении цветов' });
   }
});

router.get('/sizes', async (req, res) => {
   try {
      const [rows] = await db.query('SELECT * FROM sizes ORDER BY name ASC');
      res.json(rows);
   } catch (error) {
      console.error('Ошибка при получении размеров:', error);
      res.status(500).json({ error: 'Ошибка сервера при получении размеров' });
   }
});

router.get('/filter', async (req, res) => {
   try {
      const {
         name,
         color_id,
         size_id,
         discount_only,
         price_min,
         price_max,
         date_from,
         date_to,
      } = req.query;

      const conditions = ['1=1'];
      const params = [];

      // Фильтрация по названию
      if (name && name.trim() !== '') {
         conditions.push('p.name LIKE ?');
         params.push(`%${name.trim()}%`);
      }

      // Фильтрация по скидке
      if (discount_only === 'true') {
         conditions.push('p.discount > 0');
      }

      // Фильтрация по цене
      if (price_min && price_min.trim() !== '') {
         conditions.push('p.price >= ?');
         params.push(price_min);
      }
      if (price_max && price_max.trim() !== '') {
         conditions.push('p.price <= ?');
         params.push(price_max);
      }

      // Фильтрация по дате
      if (date_from && date_from.trim() !== '') {
         conditions.push('p.created_at >= ?');
         params.push(date_from);
      }
      if (date_to && date_to.trim() !== '') {
         conditions.push('p.created_at <= ?');
         params.push(date_to);
      }

      // Фильтрация по цвету и размеру будет в WHERE по joined таблицам
      if (color_id && color_id.trim() !== '') {
         conditions.push('ps.color_id = ?');
         params.push(color_id);
      }
      if (size_id && size_id.trim() !== '') {
         conditions.push('ps.size_id = ?');
         params.push(size_id);
      }

      // Основной запрос: товары + остатки + цвет + размер
      const sql = `
      SELECT 
        p.*,
        ps.color_id, 
        c.name as color_value, 
        c.label_armenian as color_label,
        ps.size_id, 
        s.name as size_name,
        ps.quantity
      FROM products_new p
      LEFT JOIN product_stock_new ps ON ps.product_id = p.id
      LEFT JOIN colors c ON ps.color_id = c.id
      LEFT JOIN sizes s ON ps.size_id = s.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY p.created_at DESC
    `;

      const [rows] = await db.query(sql, params);

      // Вернём массив — каждый элемент с продуктом и одним сочетанием цвет-размер-количество
      res.json(rows);

   } catch (error) {
      console.error('Ошибка при фильтрации товаров:', error);
      res.status(500).json({ error: 'Ошибка сервера при фильтрации товаров' });
   }
});

// GET: Получить остатки по продукту (по product_id)
router.get('/stock/:productId', async (req, res) => {
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

// ------------------------------------------
// Обновление остатков — публичный роут, обычно нужна авторизация,
// если мешает при тестах — закомментируй authMiddleware (не показан в твоём коде)

router.post('/stock', async (req, res) => {
   const { productId, color_id, size_id, quantity } = req.body;

   try {
      const q = Number(quantity);
      if (isNaN(q)) {
         return res.status(400).json({ error: 'Некорректное значение quantity' });
      }

      const [rows] = await db.execute(
         'SELECT id FROM product_stock_new WHERE product_id = ? AND color_id = ? AND size_id = ?',
         [productId, color_id, size_id]
      );

      if (rows.length > 0) {
         await db.execute(
            'UPDATE product_stock_new SET quantity = ? WHERE product_id = ? AND color_id = ? AND size_id = ?',
            [q, productId, color_id, size_id]
         );
      } else {
         await db.execute(
            'INSERT INTO product_stock_new (product_id, color_id, size_id, quantity) VALUES (?, ?, ?, ?)',
            [productId, color_id, size_id, q]  // тут тоже лучше использовать q
         );
      }

      res.json({ success: true });
   } catch (error) {
      console.error('Ошибка при обновлении остатка:', error);
      res.status(500).json({ error: 'Ошибка при обновлении остатка' });
   }
});

module.exports = router;
