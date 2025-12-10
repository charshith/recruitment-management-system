/**
 * Database Configuration
 * PostgreSQL connection pool setup
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'recruitment_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  // Don't exit process - let it fall back to file storage
  // process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    return res;
  } catch (error) {
    // Don't log query errors during initialization - they're expected if DB isn't set up
    if (error.code === 'ECONNREFUSED' && process.env.USE_DB !== 'true' && process.env.USE_DB !== '1') {
      throw error;
    }
    console.error('Query error:', { text, error: error.message });
    throw error;
  }
};

// Helper to get a client from the pool for transactions
const getClient = () => {
  return pool.connect();
};

module.exports = {
  pool,
  query,
  getClient
};

