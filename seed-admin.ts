import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';

async function seed() {
  try {
    const res = await db.update(users).set({
      roles: ['admin']
    }).where(eq(users.email, 'admin@darussolah.com')).returning();
    console.log('Updated admin:', res);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
seed();
