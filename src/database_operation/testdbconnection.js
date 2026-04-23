// db.js
const { Pool } = require('pg');
require('dotenv').config(); // optional: load .env file

// Database configuration
// You can either use a connection string or individual parameters

console.log("================",process.env.DB_USER);

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'Demonstration',
  password: process.env.DB_PASSWORD || 'online@112018',
  port: process.env.DB_PORT || 5432,
  // Maximum number of clients in the pool
  max: 20,
  // How long a client is allowed to remain idle before being closed
  idleTimeoutMillis: 30000,
  // How long to wait for a connection from the pool
  connectionTimeoutMillis: 2000,
});

// Test the connection
(async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully!');
    
    // Example query: get PostgreSQL version
    const res = await client.query('SELECT version()');
    console.log('PostgreSQL version:', res.rows[0].version);
    
    // Release the client back to the pool
    client.release();
  } catch (err) {
    console.error('❌ Connection error:', err.stack);
  } finally {
    // Close the pool (optional, only if you want to exit)
    await pool.end();
  }
})();

// Export the pool for reuse in other modules
module.exports = pool;