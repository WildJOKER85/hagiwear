const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

// --- Функция удаления файла ---
async function deleteFileIfExists(filePath) {
   try {
      await fsPromises.access(filePath);
      await fsPromises.unlink(filePath);
      console.log(`✅ Файл удалён: ${filePath}`);
   } catch {
      console.warn(`⚠ Файл не найден: ${filePath}`);
   }
}

// --- Multer: настройка загрузки ---
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
// GET все товары с картинками и stock
router.get('/', async (req, res) => {
   try {
      const [products] = await db.query(`
         SELECT p.id, p.name, p.description, p.price, p.discount, p.created_at,
            (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type='main' LIMIT 1) AS main_image,
            (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type='thumb1' LIMIT 1) AS thumb1,
            (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.image_type='thumb2' LIMIT 1) AS thumb2
         FROM products_new p
         ORDER BY p.created_at DESC
      `);

      const host = `${req.protocol}://${req.get('host')}`;

      const productsWithStock = await Promise.all(products.map(async (p) => {
         // Получаем stock (цвет, размер, количество)
         const [stockRows] = await db.query(`
            SELECT ps.color_id, c.name AS color_name, c.label_armenian AS color_label,
                   ps.size_id, s.name AS size_name, ps.quantity
            FROM product_stock_new ps
            LEFT JOIN colors c ON ps.color_id = c.id
            LEFT JOIN sizes s ON ps.size_id = s.id
            WHERE ps.product_id = ?
         `, [p.id]);

         // Преобразуем пути картинок в полный URL
         const makeFullUrl = (url) => url ? `${host}${url}` : null;

         return {
            ...p,
            main_image: makeFullUrl(p.main_image),
            thumb1: makeFullUrl(p.thumb1),
            thumb2: makeFullUrl(p.thumb2),
            stock: stockRows
         };
      }));

      res.json(productsWithStock);

   } catch (err) {
      console.error('Ошибка получения товаров:', err);
      res.status(500).json({ error: 'Ошибка сервера' });
   }
});

// -------------------------------------------
// Добавление нового товара
router.post(
   '/',
   upload.fields([
      { name: 'main_image', maxCount: 1 },
      { name: 'thumb1', maxCount: 1 },
      { name: 'thumb2', maxCount: 1 },
   ]),
   async (req, res) => {
      try {
         const { name, price, discount, description, color_id, size_id, quantity } = req.body;

         if (!name || !price || !color_id || !size_id || !quantity) {
            return res.status(400).json({ message: 'Не заполнены обязательные поля' });
         }

         // Добавляем товар
         const [result] = await db.execute(
            `INSERT INTO products_new (name, price, discount, description) VALUES (?, ?, ?, ?)`,
            [name, price, discount || 0, description || '']
         );
         const productId = result.insertId;

         // Сохраняем картинки
         const images = [];
         if (req.files.main_image?.[0]) {
            images.push({ product_id: productId, image_url: `/images/products/${req.files.main_image[0].filename}`, image_type: 'main' });
         }
         if (req.files.thumb1?.[0]) {
            images.push({ product_id: productId, image_url: `/images/products/${req.files.thumb1[0].filename}`, image_type: 'thumb1' });
         }
         if (req.files.thumb2?.[0]) {
            images.push({ product_id: productId, image_url: `/images/products/${req.files.thumb2[0].filename}`, image_type: 'thumb2' });
         }
         for (const img of images) {
            await db.execute(
               `INSERT INTO product_images (product_id, image_url, image_type) VALUES (?, ?, ?)`,
               [img.product_id, img.image_url, img.image_type]
            );
         }

         // Добавляем stock
         await db.execute(
            `INSERT INTO product_stock_new (product_id, color_id, size_id, quantity) VALUES (?, ?, ?, ?)`,
            [productId, color_id, size_id, quantity]
         );

         res.status(201).json({ message: 'Товар успешно добавлен', productId });

      } catch (err) {
         console.error('Ошибка добавления товара:', err);
         // Удаляем загруженные файлы при ошибке
         if (req.files) {
            Object.values(req.files).flat().forEach(file => {
               fs.unlink(file.path, () => { });
            });
         }
         res.status(500).json({ message: 'Ошибка сервера при добавлении товара' });
      }
   }
);

// -------------------------------------------
// PUT /api/products/:id
router.put('/:id', upload.fields([
   { name: 'mainImageFile', maxCount: 1 },
   { name: 'thumb1File', maxCount: 1 },
   { name: 'thumb2File', maxCount: 1 }
]), async (req, res) => {
   console.log("📥 PUT /api/products/:id called");
   console.log("📝 req.body:", req.body);
   console.log("📂 req.files:", req.files);
   const productId = req.params.id;
   const {
      name,
      description,
      price,
      discount,
      color_id,
      size_id,
      quantity,
      mainImageDeleted,
      thumb1Deleted,
      thumb2Deleted
   } = req.body;

   try {
      // 1️⃣ Обновляем основные поля продукта
      await db.query(
         `UPDATE products_new 
          SET name=?, description=?, price=?, discount=?, updated_at=NOW() 
          WHERE id=?`,
         [name, description, price, discount, productId]
      );

      // 2️⃣ Обновляем склад
      if (color_id && size_id && quantity !== undefined) {
         await db.query(
            `UPDATE product_stock_new 
             SET color_id=?, size_id=?, quantity=?
             WHERE product_id=?`,
            [color_id, size_id, quantity, productId]
         );
      }

      // 3️⃣ Функция удаления файлов
      const handleDeleteFile = async (field, deletedFlag) => {
         if (deletedFlag === 'true' || deletedFlag === true) {
            const [images] = await db.query(
               `SELECT * FROM product_images WHERE product_id=? AND image_type=?`,
               [productId, field]
            );

            // Удаляем из БД
            await db.query(
               `DELETE FROM product_images WHERE product_id=? AND image_type=?`,
               [productId, field]
            );

            // Удаляем с диска
            for (const img of images) {
               const filename = path.basename(img.image_url);
               const filePath = path.join(__dirname, '../images/products', filename);
               if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
               console.log(`✅ Файл удалён: ${filePath}`);
            }
         }
      };

      await handleDeleteFile('main', mainImageDeleted);
      await handleDeleteFile('thumb1', thumb1Deleted);
      await handleDeleteFile('thumb2', thumb2Deleted);

      // 4️⃣ Добавляем новые файлы, если они есть
      const fileMap = { mainImageFile: 'main', thumb1File: 'thumb1', thumb2File: 'thumb2' };
      for (const [key, type] of Object.entries(fileMap)) {
         if (req.files[key]?.length) {
            const file = req.files[key][0];
            console.log("💾 Сохраняю картинку:", `/images/products/${file.filename}`, "тип:", type);
            await db.query(
               `INSERT INTO product_images (product_id, image_url, image_type) VALUES (?, ?, ?)`,
               [productId, `/images/products/${file.filename}`, type]
            );
            console.log(`💾 Сохранил в БД: ${file.filename} тип: ${type}`);
         }
      }

      // 5️⃣ Возвращаем обновлённый объект продукта с актуальными URL изображений
      const [updatedProduct] = await db.query(
         `SELECT p.*, 
           (SELECT image_url 
            FROM product_images 
            WHERE product_id=p.id AND image_type='main' 
            ORDER BY id DESC LIMIT 1) AS main_image,
           (SELECT image_url 
            FROM product_images 
            WHERE product_id=p.id AND image_type='thumb1' 
            ORDER BY id DESC LIMIT 1) AS thumb1,
           (SELECT image_url 
            FROM product_images 
            WHERE product_id=p.id AND image_type='thumb2' 
            ORDER BY id DESC LIMIT 1) AS thumb2
    FROM products_new p 
    WHERE id=?`,
         [productId]
      );

      res.json(updatedProduct[0]);
   } catch (err) {
      console.error('PUT /api/products/:id error', err);
      res.status(500).json({ error: '❌ Ошибка при сохранении продукта' });
   }
});
// -------------------------------------------
// Удаление товара с картинками
router.delete('/:id', async (req, res) => {
   const productId = req.params.id;
   try {
      const [images] = await db.query('SELECT image_url FROM product_images WHERE product_id = ?', [productId]);
      for (const img of images) {
         const filePath = path.join(__dirname, '..', img.image_url.replace(/^\//, ''));
         await deleteFileIfExists(filePath);
      }

      await db.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
      await db.query('DELETE FROM product_stock_new WHERE product_id = ?', [productId]);
      await db.query('DELETE FROM products_new WHERE id = ?', [productId]);

      res.json({ message: 'Товар и все изображения удалены' });
   } catch (err) {
      console.error('Ошибка удаления товара:', err);
      res.status(500).json({ message: 'Ошибка сервера при удалении товара' });
   }
});

// -------------------------------------------
// Получение всех цветов и размеров
router.get('/colors', async (req, res) => {
   try {
      const [rows] = await db.query('SELECT * FROM colors ORDER BY name ASC');
      res.json(rows);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка сервера' });
   }
});

router.get('/sizes', async (req, res) => {
   try {
      const [rows] = await db.query('SELECT * FROM sizes ORDER BY name ASC');
      res.json(rows);
   } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка сервера' });
   }
});

module.exports = router;
