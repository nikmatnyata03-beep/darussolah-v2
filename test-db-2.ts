import { db } from './src/db/index.ts';
import { foundations, institutions } from './src/db/schema.ts';

async function check() {
  const fData = await db.select().from(foundations);
  console.log('Foundations:', fData);
  const iData = await db.select().from(institutions);
  console.log('Institutions:', iData);
  process.exit(0);
}
check();
