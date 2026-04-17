const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Demonstration',
  password: 'Online@112018',
  port: 5432,
});

module.exports = pool;