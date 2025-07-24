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