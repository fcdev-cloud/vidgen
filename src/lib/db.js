import mysql from 'mysql2/promise';

const caContent = process.env.DB_SSL_CA 
  ? Buffer.from(process.env.DB_SSL_CA, 'base64').toString('utf-8') 
  : undefined;

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
    rejectUnauthorized: true, 
    ca: caContent,
    checkServerIdentity: () => undefined
  };
}

if (!global.pool) {
  global.pool = mysql.createPool(dbConfig);
}

pool = global.pool;

export default pool;