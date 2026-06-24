require('dotenv').config('../../connection');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DBU,
  host: process.env.DBH,
  database: process.env.DBN,
  password: process.env.DBP,
  port: process.env.DBPO,
});

module.exports = pool;