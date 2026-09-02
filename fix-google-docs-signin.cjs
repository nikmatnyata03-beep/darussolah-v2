const fs = require('fs');
let code = fs.readFileSync('google-docs.js', 'utf8');

code = code.replace(
  `export const googleSignIn = async () => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);`,
  `export const googleSignIn = async () => {
  if (!auth || !provider) {
    throw new Error('Google Auth belum siap. Silakan tunggu sebentar dan coba lagi.');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);`
);

fs.writeFileSync('google-docs.js', code);
