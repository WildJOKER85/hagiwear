const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db');
const pool = require('../db');

// РЕГИСТРАЦИЯ
router.post('/register', async (req, res) => {
   const { email, password } = req.body;

   if (!email || !password) {
      return res.status(400).json({ message: 'Заполните все поля' });
   }

   try {
      const [rows] = await db.pool.execute('SELECT * FROM users WHERE email = ?', [email]);

      if (rows.length > 0) {
         return res.status(400).json({ message: 'Email уже используется' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await db.pool.execute(
         'INSERT INTO users (email, password, created_at) VALUES (?, ?, NOW())',
         [email, hashedPassword]
      );

      res.status(201).json({ message: 'Пользователь зарегистрирован' });
   } catch (err) {
      console.error('Ошибка при регистрации:', err);
      res.status(500).json({ message: 'Ошибка сервера' });
   }
});

// ЛОГИН
router.post('/login', async (req, res) => {
   const { email, password } = req.body;

   if (!email || !password) {
      return res.status(400).json({ message: 'Заполните все поля' });
   }

   try {
      const [rows] = await db.pool.execute('SELECT * FROM users WHERE email = ?', [email]);

      if (rows.length === 0) {
         return res.status(401).json({ message: 'Неверный email или пароль' });
      }

      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
         return res.status(401).json({ message: 'Неверный email или пароль' });
      }

      res.status(200).json({ message: 'Логин успешен', user: { id: user.id, email: user.email } });
   } catch (err) {
      console.error('Ошибка при логине:', err);
      res.status(500).json({ message: 'Ошибка сервера' });
   }
});

module.exports = router;
