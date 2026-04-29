const caContent = process.env.DB_SSL_CA 
  ? Buffer.from(process.env.DB_SSL_CA, 'base64').toString('utf-8') 
  : undefined;


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true, 
    ca: caContent,           // The decoded "Master Seal"
    checkServerIdentity: () => undefined // This skips hostname mismatch but keeps the cert check
  }
});