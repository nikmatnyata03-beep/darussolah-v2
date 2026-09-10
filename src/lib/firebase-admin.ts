import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseConfig } from './firebase-config.js';

// Load Firebase configuration from environment variables
const firebaseConfig = getFirebaseConfig();

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
    // Note: Admin SDK doesn't need appId or apiKey for server-side operations
    credential: process.env.FIREBASE_ADMIN_CREDENTIAL 
      ? JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIAL)
      : undefined,
  });
}

export const adminAuth = getAuth();
