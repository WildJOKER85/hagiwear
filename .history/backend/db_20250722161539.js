const mysql = require('mysql2/promise');

const pool = mysql.createPool({
   host: 'localhost',      // здесь должен быть правильный адрес
   user: 'root',           // твой пользователь
   password: 'root1234',  // пароль
   database: 'hagiwear',   // твоя база
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0,
});

module.exports = pool;