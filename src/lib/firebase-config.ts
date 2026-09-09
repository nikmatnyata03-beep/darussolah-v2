/**
 * Firebase Configuration Loader
 * 
 * This module loads Firebase configuration from environment variables
 * to avoid hardcoded secrets in the codebase.
 * 
 * Usage: Import loadFirebaseConfig() and call it during application initialization.
 */

import { config as dotenvConfig } from 'dotenv';

// Load environment variables from .env file
dotenvConfig();

export interface FirebaseConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  measurementId: string;
  oAuthClientId: string;
  recaptchaSiteKey: string;
}

/**
 * Loads Firebase configuration from environment variables.
 * @returns FirebaseConfig object with all required configuration
 * @throws Error if any required environment variable is missing
 */
export const loadFirebaseConfig = (): FirebaseConfig => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const appId = process.env.FIREBASE_APP_ID;
  const apiKey = process.env.FIREBASE_API_KEY;
  const authDomain = process.env.FIREBASE_AUTH_DOMAIN;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID;
  const measurementId = process.env.FIREBASE_MEASUREMENT_ID || '';
  const oAuthClientId = process.env.FIREBASE_OAUTH_CLIENT_ID;
  const recaptchaSiteKey = process.env.FIREBASE_RECAPTCHA_SITE_KEY || '';

  // Validate required fields
  const missingVars: string[] = [];
  
  if (!projectId) missingVars.push('FIREBASE_PROJECT_ID');
  if (!appId) missingVars.push('FIREBASE_APP_ID');
  if (!apiKey) missingVars.push('FIREBASE_API_KEY');
  if (!authDomain) missingVars.push('FIREBASE_AUTH_DOMAIN');
  if (!storageBucket) missingVars.push('FIREBASE_STORAGE_BUCKET');
  if (!messagingSenderId) missingVars.push('FIREBASE_MESSAGING_SENDER_ID');
  if (!oAuthClientId) missingVars.push('FIREBASE_OAUTH_CLIENT_ID');

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingVars.join(', ')}. ` +
      'Please check your .env file or environment configuration.'
    );
  }

  return {
    projectId,
    appId,
    apiKey,
    authDomain,
    storageBucket,
    messagingSenderId,
    measurementId,
    oAuthClientId,
    recaptchaSiteKey,
  };
};

/**
 * Validates that all required Firebase configuration is present.
 * @returns true if configuration is valid, throws error otherwise
 */
export const validateFirebaseConfig = (config: FirebaseConfig): boolean => {
  if (!config.projectId || !config.appId || !config.apiKey) {
    throw new Error('Invalid Firebase configuration: missing required fields');
  }
  return true;
};

// Export a singleton instance for convenience
let cachedConfig: FirebaseConfig | null = null;

export const getFirebaseConfig = (): FirebaseConfig => {
  if (!cachedConfig) {
    cachedConfig = loadFirebaseConfig();
  }
  return cachedConfig;
};
