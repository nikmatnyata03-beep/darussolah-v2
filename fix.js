import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
pool.query('ALTER TABLE staff DROP COLUMN institution_id;').then(() => console.log('ok')).catch(console.error).finally(() => process.exit(0));
