const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'wearhagi@gmail.com';

// Настройка nodemailer для Gmail
const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: 'wearhagi@gmail.com',
      pass: 'Tagmoneyflow$',
   },
});

router.post('/', async (req, res) => {
   const {
      userId,
      items,
      totalPrice,
      paymentMethod,
      deliveryAddress,
      userEmail,
      shippingDetails = {},
   } = req.body;

   if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Զամբյուղը դատարկ է կամ սխալ ձևաչափով է' });
   }
   if (!paymentMethod) {
      return res.status(400).json({ message: 'Ընտրեք վճարման եղանակ' });
   }
   if (!deliveryAddress) {
      return res.status(400).json({ message: 'Նշեք առաքման հասցեն' });
   }
   if (!userEmail) {
      return res.status(400).json({ message: 'Պակասում է օգտվողի էլ․ հասցեն' });
   }

   try {
      await db.query('START TRANSACTION');

      const [orderResult] = await db.execute(
         `INSERT INTO orders (user_id, total_price, payment_method, delivery_address, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
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
         `INSERT INTO order_items (order_id, product_id, size, quantity, price_at_purchase)
       VALUES ?`,
         [orderItemsValues]
      );

      await db.query('COMMIT');

      // Email для администратора (на армянском)
      const adminMailOptions = {
         from: 'wearhagi@gmail.com',
         to: ADMIN_EMAIL,
         subject: `Նոր պատվեր №${orderId}`,
         text: `
📦 Նոր պատվեր №${orderId}

👤 Գնորդ՝ ${userEmail || 'Անհայտ'}

💳 Վճարման եղանակ՝ ${paymentMethod === 'cash' ? 'Կանխիկ' : 'Քարտ'}

📍 Առաքման հասցե՝ ${deliveryAddress}

📋 Պատվերի բովանդակություն:
${items.map(i => `• Ապրանք №${i.productId}, Չափս: ${i.size}, Քանակ: ${i.quantity}, Գին: ${i.price} ֏`).join('\n')}

💰 Ընդհանուր գումար՝ ${totalPrice} ֏
      `,
      };

      // Email для пользователя (на армянском)
      const userMailOptions = {
         from: 'wearhagi@gmail.com',
         to: userEmail,
         subject: `Հաստատում ենք ձեր պատվերը №${orderId}`,
         text: `
Շնորհակալություն ձեր պատվերի համար:

📦 Պատվեր №${orderId}
💰 Գումար՝ ${totalPrice} ֏
💳 Վճարում՝ ${paymentMethod === 'cash' ? 'Կանխիկ' : 'Քարտ'}
📍 Առաքում՝ ${deliveryAddress}

Մենք կկապվենք ձեզ հետ մանրամասների համար։ Խնդրում ենք լինել հասանելի։
      `,
      };

      transporter.sendMail(adminMailOptions, err => {
         if (err) console.error('SMTP Admin error:', err);
      });

      transporter.sendMail(userMailOptions, err => {
         if (err) console.error('SMTP User error:', err);
      });

      res.status(201).json({ message: 'Պատվերը հաջողությամբ ընդունվել է', orderId });
   } catch (error) {
      await db.query('ROLLBACK');
      console.error('Order creation error:', error);
      res.status(500).json({ message: 'Սերվերի սխալ պատվերը պահպանելիս' });
   }
});

module.exports = router;
