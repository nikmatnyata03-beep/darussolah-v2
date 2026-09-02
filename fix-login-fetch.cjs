const fs = require('fs');
let code = fs.readFileSync('login.html', 'utf8');

const targetScript = code.substring(code.indexOf('<script type="module">'), code.indexOf('</script>') + 9);

// Let's manually replace the login part.
// First, we can move fetch outside.
let newScript = targetScript.replace(
  `    googleLoginBtn.addEventListener('click', async () => {
      try {
        const resConfig = await fetch('/firebase-applet-config.json');
        const firebaseConfig = await resConfig.json();
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);`,
  `
    let auth, provider;
    // Pre-initialize firebase
    fetch('/firebase-applet-config.json').then(r => r.json()).then(config => {
      const app = !getApps().length ? initializeApp(config) : getApp();
      auth = getAuth(app);
      provider = new GoogleAuthProvider();
    }).catch(console.error);
    
    googleLoginBtn.addEventListener('click', async () => {
      if (!auth || !provider) {
         showMessage('Sistem belum siap', 'Harap tunggu sesaat hingga konfigurasi dimuat.', 'error');
         return;
      }
      try {
        const result = await signInWithPopup(auth, provider);`
);

code = code.replace(targetScript, newScript);
fs.writeFileSync('login.html', code);
