import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const dbName = process.env.DB_NAME ? process.env.DB_NAME.replace(/^"|"$/g, '').trim() : '';

const lms = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  port: Number(process.env.DB_PORT) || 5432,
  password: String(process.env.DB_PASSWORD ?? ''),
  database: dbName
});

lms.on('connect', () => {
  console.log("PostgreSQL Connected :");
});

lms.on('error', (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

export default lms;