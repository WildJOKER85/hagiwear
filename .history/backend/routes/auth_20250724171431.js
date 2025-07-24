const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// ✅ Регистрация
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
      console.error('❌ Ошибка регистрации:', error.message, error.stack);
      res.status(500).json({ error: 'Ошибка сервера', details: error.message });
   }
});

module.exports = router;

require('dotenv').config();
console.log(process.env.DB_HOST, process.env.DB_USER, process.env.DB_NAME);

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // убедись, что этот файл существует и экспортирует router

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Настройка CORS
app.use(cors({
   origin: ['http://localhost:3000', 'https://hagiwear.com', 'https://test.hagiwear.com'],
   methods: ['GET', 'POST'],
   credentials: true,
}));
app.options('*', cors());

app.use(express.json());

// ✅ Корневой маршрут
app.get('/', (req, res) => {
   res.send('✅ Hagiwear backend is running!');
});

// ✅ API маршруты
app.use('/api', authRoutes); // всё в порядке, если authRoutes — это Router
// например: router.post('/register', ...) → будет доступен по /api/register

// ✅ Запуск сервера
app.listen(PORT, () => {
   console.log(✅ Сервер работает на порту ${ PORT });
});