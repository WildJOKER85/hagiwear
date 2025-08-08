const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Лучше заменить в .env на сложный секрет!

// РЕГИСТРАЦИЯ с валидацией
router.post(
   '/register',
   [
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

      const { email, password } = req.body;

      try {
         const [existingUsers] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
         if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
         }

         const hashedPassword = await bcrypt.hash(password, 10);

         await pool.execute(
            'INSERT INTO users (email, password, created_at) VALUES (?, ?, NOW())',
            [email, hashedPassword]
         );

         res.status(201).json({ message: 'Регистрация успешна' });
      } catch (err) {
         console.error('Ошибка при регистрации:', err);
         res.status(500).json({ message: 'Ошибка сервера' });
      }
   }
);

// ЛОГИН с валидацией — возвращаем JWT токен
router.post(
   '/login',
   [
      body('email').isEmail().withMessage('Укажите корректный email'),
      body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов'),
   ],
   async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      try {
         const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

         if (users.length === 0) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
         }

         const user = users[0];
         const isMatch = await bcrypt.compare(password, user.password);

         if (!isMatch) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
         }

         const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
         );

         res.status(200).json({ message: 'Логин успешен', token });
      } catch (err) {
         console.error('Ошибка при логине:', err);
         res.status(500).json({ message: 'Ошибка сервера' });
      }
   }
);

// Middleware для проверки токена — экспортируем для защиты других роутов
function authenticateToken(req, res, next) {
   const authHeader = req.headers['authorization'];
   const token = authHeader && authHeader.split(' ')[1]; // ожидаем формат "Bearer TOKEN"

   if (!token) return res.status(401).json({ message: 'Токен не предоставлен' });

   jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Неверный токен' });

      req.user = user; // В req.user попадает payload из токена
      next();
   });
}

module.exports = { router, authenticateToken };
