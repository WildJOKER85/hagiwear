const jwt = require('jsonwebtoken');

// Секретный ключ из .env
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

function authMiddleware(req, res, next) {
   const authHeader = req.headers.authorization;

   // Проверка: есть ли заголовок Authorization
   if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Անհրաժեշտ է մուտք գործել (No token provided)' });
   }

   const token = authHeader.split(' ')[1];

   try {
      // Проверка токена
      const decoded = jwt.verify(token, JWT_SECRET);

      // Сохраняем user info (например, id) в req.user
      req.user = decoded;

      // Продолжаем выполнение запроса
      next();
   } catch (error) {
      return res.status(401).json({ error: 'Անվավեր token կամ ժամկետը լրացել է (Invalid or expired token)' });
   }
}

module.exports = authMiddleware;
