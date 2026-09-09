import { adminAuth } from './src/lib/firebase-admin.js';
import { db } from './src/db/index.js';
import { users } from './src/db/schema.js';
import { eq } from 'drizzle-orm';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

// Get passwords from environment variables with secure defaults
const ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD;
const GURU_PASSWORD = process.env.DEFAULT_GURU_PASSWORD;

// Validate that passwords are set
if (!ADMIN_PASSWORD || !GURU_PASSWORD) {
  console.error('ERROR: Default passwords must be set in environment variables.');
  console.error('Please set DEFAULT_ADMIN_PASSWORD and DEFAULT_GURU_PASSWORD in your .env file.');
  console.error('Never use hardcoded passwords in production code.');
  process.exit(1);
}

// Warn if using weak passwords
const weakPasswordPatterns = ['password', '123', 'admin', 'test', 'default'];
const isWeakPassword = (pwd: string) => {
  return weakPasswordPatterns.some(pattern => pwd.toLowerCase().includes(pattern));
};

if (isWeakPassword(ADMIN_PASSWORD) || isWeakPassword(GURU_PASSWORD)) {
  console.warn('WARNING: You are using a weak default password. Please change it in production!');
}

const createUser = async (email: string, password: string, displayName: string, roles: string[]) => {
  let uid: string;
  try {
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName,
    });
    uid = userRecord.uid;
    console.log(`Created Firebase user ${email} with uid ${uid}`);
  } catch (error: any) {
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
    console.log('Seeding users with environment-provided passwords...');
    await createUser('admin@tester.com', ADMIN_PASSWORD, 'Admin Tester', ['admin']);
    await createUser('guru@tester.com', GURU_PASSWORD, 'Guru Tester', ['guru']);
    console.log('Seed completed successfully!');
    console.log('IMPORTANT: Change these default passwords immediately in production!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

run();
