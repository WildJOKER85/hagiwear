const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

const authRouter = require('./routes/auth');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const productImagesRouter = require('./routes/productImages');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Чтобы в API можно было формировать правильный URL для картинок
const HOST_URL = `http://localhost:${PORT}`;

// Добавляем в каждый запрос hostUrl (используется для формирования полного пути к картинкам)
app.use((req, res, next) => {
   req.hostUrl = HOST_URL;
   next();
});

app.use(cors());

// Не используем express.json() и express.urlencoded() глобально — multer будет обрабатывать multipart/form-data

app.use(morgan('dev'));

// Статика для картинок
app.use('/images', express.static(path.join(__dirname, 'images')));


// Роуты API
app.use('/api/product-images', productImagesRouter);

// multer настроен внутри productsRouter — здесь без express.json()/urlencoded
app.use('/api/products', productsRouter);

// Для остальных роутов, где нет файлов — используем express.json() локально
app.use('/api/auth', express.json(), authRouter);
app.use('/api/cart', express.json(), cartRouter);

app.get('/', (req, res) => {
   res.send('✅ Backend работает локально!');
});

// Обработчик ошибок
app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).json({ error: '❌ Что-то пошло не так на сервере' });
});

app.listen(PORT, () => {
   console.log(`✅ Server is running on http://localhost:${PORT}`);
});
