import { db } from './src/db/index.ts';
import { institutions } from './src/db/schema.ts';

async function check() {
  const data = await db.select().from(institutions);
  console.log('Institutions:', data);
  process.exit(0);
}
check();
