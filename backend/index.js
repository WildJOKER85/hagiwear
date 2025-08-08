const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

const { router: authRouter, authenticateToken } = require('./routes/auth');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const productImagesRouter = require('./routes/productImages');
const colorsRouter = require('./routes/colors');
const sizesRouter = require('./routes/sizes');
const stockRouter = require('./routes/stock');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Динамическое формирование полного URL для картинок и ссылок
app.use((req, res, next) => {
   req.hostUrl = `${req.protocol}://${req.get('host')}`;
   next();
});

app.use(cors());

// Логирование запросов
app.use(morgan('dev'));

// Статические файлы (картинки)
app.use('/images', express.static(path.join(__dirname, 'images')));

// Роуты API
app.use('/api/product-images', productImagesRouter);

// multer внутри productsRouter обрабатывает multipart/form-data — поэтому не ставим express.json() глобально для него
app.use('/api/products', productsRouter);

// Для остальных роутов, где данные в JSON формате — подключаем express.json() локально
app.use('/api/auth', express.json(), authRouter);
// Если у тебя нет реального protectedRouter — закомментируй или удали эту строку.
// В будущем, когда сделаешь защищённые роуты — подключай так:
// app.use('/api/protected-route', authenticateToken, protectedRouter);

app.use('/api/cart', express.json(), cartRouter);
app.use('/api/colors', express.json(), colorsRouter);
app.use('/api/sizes', express.json(), sizesRouter);
app.use('/api/stock', express.json(), stockRouter);

// Корень сервера — простой тест
app.get('/', (req, res) => {
   res.send('✅ Backend работает локально!');
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).json({ error: '❌ Что-то пошло не так на сервере' });
});

// Запуск сервера
app.listen(PORT, () => {
   console.log(`✅ Server is running on http://localhost:${PORT}`);
});
