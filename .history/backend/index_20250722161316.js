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

app.use((req, res, next) => {
   req.hostUrl = HOST_URL;
   next();
});

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Статика для картинок
app.use('/images', express.static(path.join(__dirname, 'images')));

// Роуты API
app.use('/api/product-images', productImagesRouter);
app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);

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
