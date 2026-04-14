import mysql from 'mysql2/promise';

// Create a connection pool so you don't exhaust MySQL connections
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'vidgen',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;