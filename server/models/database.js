const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.on('connect', () => {
  // Connected to database
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

module.exports = pool;