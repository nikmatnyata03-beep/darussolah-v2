const fs = require('fs');
let code = fs.readFileSync('google-docs.js', 'utf8');

code = code.replace(
  `export const googleSignIn = async () => {
  if (!auth || !provider) {
    throw new Error('Google Auth belum siap. Silakan tunggu sebentar dan coba lagi.');
  }`,
  `export const googleSignIn = async () => {
  if (isSigningIn) throw new Error('Sign in already in progress');
  if (!auth || !provider) {
    throw new Error('Google Auth belum siap. Silakan tunggu sebentar dan coba lagi.');
  }`
);

fs.writeFileSync('google-docs.js', code);
