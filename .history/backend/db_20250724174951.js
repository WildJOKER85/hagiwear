const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_NAME,
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0,
});

(async () => {
   try {
      const connection = await pool.getConnection();
      console.log('✅ Успешное подключение к базе данных');
      connection.release();
   } catch (err) {
      console.error('❌ Ошибка подключения к базе данных:', err.message);
   }
})();

module.exports = pool; // ✅ просто pool, без { pool }
