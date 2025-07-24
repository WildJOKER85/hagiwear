const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// Регистрация
router.post('/register', async (req, res) => {
   const { email, password } = req.body;

   if (!email || !password) {
      return res.status(400).json({ error: 'Заполните все поля' });
   }

   try {
      const [rows] = await db.pool.execute('SELECT * FROM users WHERE email = ?', [email]);

      if (rows.length > 0) {
         return res.status(409).json({ error: 'Email уже зарегистрирован' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await db.pool.execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

      res.status(201).json({ message: 'Регистрация успешна' });
   } catch (error) {
      console.error('Ошибка регистрации:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
   }
});

// Логин
router.post('/login', async (req, res) => {
   const { email, password } = req.body;

   if (!email || !password) {
      return res.status(400).json({ error: 'Заполните все поля' });
   }

   try {
      const [rows] = await db.pool.execute('SELECT * FROM users WHERE email = ?', [email]);

      if (rows.length === 0) {
         return res.status(401).json({ error: 'Пользователь не найден' });
      }

      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
         return res.status(401).json({ error: 'Неверный пароль' });
      }

      res.json({ message: 'Вход успешен' });
   } catch (error) {
      console.error('Ошибка при логине:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
   }
});

module.exports = router;
