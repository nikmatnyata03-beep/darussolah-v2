import { db } from './src/db/index.ts';
import { sql } from 'drizzle-orm';

async function run() {
  try {
    await db.execute(sql`ALTER TABLE staff DROP COLUMN institution_id;`);
    console.log('Dropped institution_id from staff');
  } catch (e) {
    console.log('Error dropping:', e.message);
  }
  process.exit(0);
}
run();
