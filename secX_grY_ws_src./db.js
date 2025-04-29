const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'lysy',
  password: 'lysy12345678',
  database: 'sec2_gr13_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

module.exports = { pool, query };