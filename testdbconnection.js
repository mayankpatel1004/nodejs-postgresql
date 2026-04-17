const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully!');
    const res = await client.query('SELECT version()');
    console.log('PostgreSQL version:', res.rows[0].version);
    client.release();
  } catch (err) {
    console.error('❌ Connection error:', err.stack);
  } finally {
    await pool.end();
  }
})();
module.exports = pool;