import { adminAuth } from './src/lib/firebase-admin.ts';
import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';
import { eq } from 'drizzle-orm';

const createUser = async (email, password, displayName, roles) => {
  let uid;
  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });
    uid = userRecord.uid;
    console.log(`Created Firebase user ${email} with uid ${uid}`);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      const userRecord = await adminAuth.getUserByEmail(email);
      uid = userRecord.uid;
      console.log(`Firebase user ${email} already exists with uid ${uid}`);
    } else {
      throw error;
    }
  }

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    await db.update(users).set({ roles }).where(eq(users.email, email));
    console.log(`Updated SQL user ${email} roles to ${roles.join(', ')}`);
  } else {
    await db.insert(users).values({ uid, email, roles });
    console.log(`Inserted SQL user ${email} with roles ${roles.join(', ')}`);
  }
};

const run = async () => {
  try {
    await createUser('admin@tester.com', 'password123', 'Admin Tester', ['admin']);
    await createUser('guru@tester.com', 'password123', 'Guru Tester', ['guru']);
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

run();
