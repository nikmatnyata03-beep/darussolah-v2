import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirebaseConfig } from './firebase-config.js';

// Load Firebase configuration from environment variables
const firebaseConfig = getFirebaseConfig();

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId,
    // Note: Admin SDK doesn't need apiKey for server-side operations
    // but we include it for completeness if needed by other parts of the app
  });
}

export const adminAuth = getAuth();
