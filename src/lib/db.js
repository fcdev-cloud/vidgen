import mysql from 'mysql2/promise';

/**
 * Universal Database Connection Pool
 * Works for Local XAMPP (MySQL/MariaDB) and TiDB Cloud (Vercel)
 */

let pool;

// Configuration object
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER || process.env.DB_USERNAME, // Handles both naming conventions
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
};

// Only apply SSL if NOT on localhost
if (process.env.DB_SSL_REJECT !== 'false') {
  dbConfig.ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  };
}

if (!global.pool) {
  global.pool = mysql.createPool(dbConfig);
}

pool = global.pool;

export default pool;