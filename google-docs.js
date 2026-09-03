import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

let firebaseConfig = null;

async function fetchFirebaseConfig() {
  if (firebaseConfig) return firebaseConfig;
  const res = await fetch('/firebase-applet-config.json');
  firebaseConfig = await res.json();
  return firebaseConfig;
}

let auth = null;
let provider = null;
let isSigningIn = false;
let cachedAccessToken = null;

export const initGoogleAuth = async (onAuthSuccess, onAuthFailure) => {
  const config = await fetchFirebaseConfig();
  const app = !getApps().length ? initializeApp(config) : getApp();
  auth = getAuth(app);
  
  provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/documents');
  provider.addScope('https://www.googleapis.com/auth/documents.readonly');
  provider.addScope('https://www.googleapis.com/auth/drive');
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('https://www.googleapis.com/auth/drive.readonly');
  provider.addScope('https://www.googleapis.com/auth/spreadsheets');
  provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
  provider.addScope('https://mail.google.com/');
  provider.addScope('https://www.googleapis.com/auth/gmail.addons.current.action.compose');
  provider.addScope('https://www.googleapis.com/auth/gmail.addons.current.message.action');
  provider.addScope('https://www.googleapis.com/auth/gmail.addons.current.message.metadata');
  provider.addScope('https://www.googleapis.com/auth/gmail.addons.current.message.readonly');
  provider.addScope('https://www.googleapis.com/auth/gmail.compose');
  provider.addScope('https://www.googleapis.com/auth/gmail.insert');
  provider.addScope('https://www.googleapis.com/auth/gmail.labels');
  provider.addScope('https://www.googleapis.com/auth/gmail.metadata');
  provider.addScope('https://www.googleapis.com/auth/gmail.modify');
  provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
  provider.addScope('https://www.googleapis.com/auth/gmail.send');
  provider.addScope('https://www.googleapis.com/auth/gmail.settings.basic');
  provider.addScope('https://www.googleapis.com/auth/gmail.settings.sharing');

  return onAuthStateChanged(auth, (user) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async () => {
  if (isSigningIn) throw new Error('Sign in already in progress');
  if (!auth || !provider) {
    throw new Error('Google Auth belum siap. Silakan tunggu sebentar dan coba lagi.');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = () => cachedAccessToken;

export const logoutGoogle = async () => {
  if (auth) {
    await auth.signOut();
  }
  cachedAccessToken = null;
};

export const fetchGoogleDocs = async (token) => {
  const res = await fetch('https://www.googleapis.com/drive/v3/files?q=mimeType=\'application/vnd.google-apps.document\' and trashed=false', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch Google Docs');
  return res.json();
};

export const createGoogleSheet = async (token, title, rows) => {
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ properties: { title } })
  });
  if (!createRes.ok) throw new Error('Failed to create Google Sheet');
  const sheet = await createRes.json();
  
  if (rows && rows.length > 0) {
    const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheet.spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: rows })
    });
    if (!updateRes.ok) throw new Error('Failed to append data to Google Sheet');
  }
  return sheet;
};

export const sendEmail = async (token, to, subject, bodyText) => {
  const emailLines = [
    `To: ${to}`,
    'Content-type: text/html;charset=iso-8859-1',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    bodyText
  ];
  const email = emailLines.join('\r\n');
  const base64EncodedEmail = btoa(unescape(encodeURIComponent(email))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: base64EncodedEmail })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error('Failed to send email: ' + (err.error?.message || 'Unknown error'));
  }
  return res.json();
};

export const fetchEmails = async (token, maxResults = 10) => {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch emails');
  return res.json();
};
