const { db } = require('./src/db/index.ts');
const { sql } = require('drizzle-orm');

async function run() {
  try {
    await db.execute(sql`ALTER TABLE registrations ADD COLUMN notes TEXT;`);
    console.log('Added notes column successfully');
  } catch (err) {
    console.error('Error (might already exist):', err.message);
  }
}
run();
