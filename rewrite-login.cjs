const fs = require('fs');
let code = fs.readFileSync('login.html', 'utf8');

const oldLogin = `    googleLoginBtn.addEventListener('click', async () => {
      try {
        const resConfig = await fetch('/firebase-applet-config.json');
        const firebaseConfig = await resConfig.json();
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();

        const result = await signInWithPopup(auth, provider);`;

const newLogin = `    let auth, provider;
    // Pre-initialize Firebase to prevent popup block
    fetch('/firebase-applet-config.json').then(r => r.json()).then(config => {
      const app = !getApps().length ? initializeApp(config) : getApp();
      auth = getAuth(app);
      provider = new GoogleAuthProvider();
    }).catch(console.error);

    googleLoginBtn.addEventListener('click', async () => {
      if (!auth || !provider) {
         showAuthMessage('Sistem belum siap', 'Harap tunggu sesaat hingga konfigurasi dimuat.');
         return;
      }
      try {
        const result = await signInWithPopup(auth, provider);`;

code = code.replace(oldLogin, newLogin);
fs.writeFileSync('login.html', code);
