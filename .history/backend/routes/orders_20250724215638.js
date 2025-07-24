const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // админский email из .env

// Настройка nodemailer (пример с Gmail)
const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
      user: process.env.EMAIL_USER,       // твой email
      pass: process.env.EMAIL_PASS,       // пароль или app password
   },
});

// POST /api/orders — создать заказ
router.post('/', async (req, res) => {
   const { userId, items, totalPrice, paymentMethod, deliveryAddress, userEmail } = req.body;

   if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Корзина пуста или некорректна' });
   }
   if (!paymentMethod) {
      return res.status(400).json({ message: 'Не выбран способ оплаты' });
   }
   if (!deliveryAddress) {
      return res.status(400).json({ message: 'Не указан адрес доставки' });
   }
   if (!userEmail) {
      return res.status(400).json({ message: 'Не указан email пользователя' });
   }

   try {
      // Начинаем транзакцию, чтобы все операции прошли атомарно
      await db.query('START TRANSACTION');

      // Сохраняем заказ (orders)
      const [orderResult] = await db.execute(
         'INSERT INTO orders (user_id, total_price, payment_method, delivery_address, created_at) VALUES (?, ?, ?, ?, NOW())',
         [userId || null, totalPrice, paymentMethod, deliveryAddress]
      );

      const orderId = orderResult.insertId;

      // Сохраняем позиции заказа (order_items)
      const orderItemsValues = items.map(item => [
         orderId,
         item.productId,
         item.size,
         item.quantity,
         item.price,
      ]);
      await db.query(
         'INSERT INTO order_items (order_id, product_id, size, quantity, price) VALUES ?',
         [orderItemsValues]
      );

      await db.query('COMMIT');

      // Формируем письмо админу
      const adminMailOptions = {
         from: process.env.EMAIL_USER,
         to: ADMIN_EMAIL,
         subject: `Новый заказ №${orderId}`,
         text: `Поступил новый заказ №${orderId}.
Покупатель: ${userEmail || 'Гость'}
Общая сумма: ${totalPrice} ֏
Способ оплаты: ${paymentMethod}
Адрес доставки: ${deliveryAddress}
Позиции заказа:
${items.map(i => `- ${i.productId} (Размер: ${i.size}) x${i.quantity} — ${i.price} ֏`).join('\n')}
      `,
      };

      // Формируем письмо клиенту
      const userMailOptions = {
         from: process.env.EMAIL_USER,
         to: userEmail,
         subject: `Подтверждение заказа №${orderId}`,
         text: `Спасибо за ваш заказ №${orderId}!
Сумма: ${totalPrice} ֏
Способ оплаты: ${paymentMethod}
Адрес доставки: ${deliveryAddress}

Мы свяжемся с вами для уточнения деталей.
`,
      };

      // Отправляем письма (без await, чтобы не блокировать)
      transporter.sendMail(adminMailOptions, (err, info) => {
         if (err) console.error('Ошибка отправки письма админу:', err);
         else console.log('Письмо админу отправлено:', info.response);
      });

      transporter.sendMail(userMailOptions, (err, info) => {
         if (err) console.error('Ошибка отправки письма клиенту:', err);
         else console.log('Письмо клиенту отправлено:', info.response);
      });

      res.status(201).json({ message: 'Заказ успешно создан', orderId });
   } catch (error) {
      await db.query('ROLLBACK');
      console.error('Ошибка создания заказа:', error);
      res.status(500).json({ message: 'Ошибка сервера при создании заказа' });
   }
});

module.exports = router;
