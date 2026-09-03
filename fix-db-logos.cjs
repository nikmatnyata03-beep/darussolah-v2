const { db } = require('./src/db/index.ts');
const { institutions } = require('./src/db/schema.ts');
const { eq } = require('drizzle-orm');

async function fix() {
  await db.update(institutions).set({ logoUrl: '/darussolah-assets/TPQ darul jinan.jpeg' }).where(eq(institutions.slug, 'tpq'));
  await db.update(institutions).set({ logoUrl: '/darussolah-assets/majelis darussolah.jpeg' }).where(eq(institutions.slug, 'mdt'));
  await db.update(institutions).set({ logoUrl: '/darussolah-assets/RA darussolah.jpeg' }).where(eq(institutions.slug, 'ra'));
  await db.update(institutions).set({ logoUrl: '/darussolah-assets/RTQ darussolah.jpeg' }).where(eq(institutions.slug, 'rtq'));
  console.log('Database updated!');
}
fix();
