const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

const ADMIN_EMAIL = 'wearhagi@gmail.com';

const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
   },
});

// POST /api/orders — создать заказ
router.post('/', async (req, res) => {
   const { userId, items, totalPrice, paymentMethod, deliveryAddress, userEmail } = req.body;

   if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Ձեր զամբյուղը դատարկ է կամ սխալ ձևաչափով է' });
   }
   if (!paymentMethod) {
      return res.status(400).json({ message: 'Ընտրեք վճարման եղանակը' });
   }
   if (!deliveryAddress) {
      return res.status(400).json({ message: 'Նշեք առաքման հասցեն' });
   }
   if (!userEmail) {
      return res.status(400).json({ message: 'Նշեք Ձեր էլ․ հասցեն' });
   }

   try {
      await db.query('START TRANSACTION');

      const [orderResult] = await db.execute(
         'INSERT INTO orders (user_id, total_price, payment_method, delivery_address, created_at) VALUES (?, ?, ?, ?, NOW())',
         [userId || null, totalPrice, paymentMethod, deliveryAddress]
      );
      const orderId = orderResult.insertId;

      const orderItemsValues = items.map(item => [
         orderId,
         item.productId,
         item.size,
         item.quantity,
         item.price,
      ]);

      await db.query(
         'INSERT INTO order_items (order_id, product_id, size, quantity, price_at_purchase) VALUES ?',
         [orderItemsValues]
      );

      await db.query('COMMIT');

      // Email админу
      const adminMailOptions = {
         from: process.env.EMAIL_USER,
         to: ADMIN_EMAIL,
         subject: `Նոր պատվեր №${orderId}`,
         text: `Ստացվել է նոր պատվեր №${orderId}։

Էլ․ հասցե՝ ${userEmail || 'Գեստ'}
Ընդհանուր գումար՝ ${totalPrice} ֏
Վճարման եղանակ՝ ${paymentMethod}
Առաքման հասցե՝ ${deliveryAddress}

Պատվերի ապրանքներ՝
${items.map(i => `- Ապրանք №${i.productId} | Չափս՝ ${i.size} | Քանակ՝ ${i.quantity} | Գին՝ ${i.price} ֏`).join('\n')}
`,
      };

      // Email пользователю
      const userMailOptions = {
         from: process.env.EMAIL_USER,
         to: userEmail,
         subject: `Պատվերը հաստատվել է №${orderId}`,
         text: `Շնորհակալություն պատվերի համար №${orderId}։

Ընդհանուր գումար՝ ${totalPrice} ֏
Վճարման եղանակ՝ ${paymentMethod}
Առաքման հասցե՝ ${deliveryAddress}

Մենք կկապնվենք Ձեզ հետ մանրամասների համար։`,
      };

      transporter.sendMail(adminMailOptions, (err, info) => {
         if (err) console.error('Խափանում՝ ուղարկման ժամանակ (admin):', err);
         else console.log('Admin email ուղարկված է:', info.response);
      });

      transporter.sendMail(userMailOptions, (err, info) => {
         if (err) console.error('Խափանում՝ ուղարկման ժամանակ (user):', err);
         else console.log('User email ուղարկված է:', info.response);
      });

      res.status(201).json({ message: 'Պատվերը հաջողությամբ կատարվել է', orderId });
   } catch (err) {
      await db.query('ROLLBACK');
      console.error('Պատվերի ստեղծման սխալ:', err);
      res.status(500).json({ message: 'Սերվերի սխալ՝ պատվերը ստեղծելու ժամանակ' });
   }
});

// GET /api/orders/:userId — получить заказы одного пользователя
router.get('/:userId', async (req, res) => {
   const { userId } = req.params;

   try {
      const [orders] = await db.execute(
         'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
         [userId]
      );

      const ordersWithItems = await Promise.all(
         orders.map(async order => {
            const [items] = await db.execute(
               'SELECT * FROM order_items WHERE order_id = ?',
               [order.id]
            );
            return { ...order, items };
         })
      );

      res.json(ordersWithItems);
   } catch (err) {
      console.error('Սխալ՝ օգտվողի պատվերները ստանալու ժամանակ:', err);
      res.status(500).json({ message: 'Սերվերի սխալ' });
   }
});

// GET /api/orders — все заказы (админ)
router.get('/', async (req, res) => {
   try {
      const [orders] = await db.execute(
         'SELECT * FROM orders ORDER BY created_at DESC'
      );

      const ordersWithItems = await Promise.all(
         orders.map(async order => {
            const [items] = await db.execute(
               'SELECT * FROM order_items WHERE order_id = ?',
               [order.id]
            );
            return { ...order, items };
         })
      );

      res.json(ordersWithItems);
   } catch (err) {
      console.error('Սխալ՝ բոլոր պատվերները ստանալու ժամանակ:', err);
      res.status(500).json({ message: 'Սերվերի սխալ' });
   }
});

module.exports = router;
