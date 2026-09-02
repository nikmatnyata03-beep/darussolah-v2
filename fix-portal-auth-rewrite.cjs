const fs = require('fs');
let code = fs.readFileSync('darussolah-portal.js', 'utf8');

const targetToReplace = `    // Read Firebase token from localStorage
    const firebaseToken = localStorage.getItem('dwj-access-token');
    if (!firebaseToken) {

      const redirect = \`\${window.location.pathname.split('/').pop() || 'index.html'}\${window.location.search}\`;
      window.location.replace(\`login.html?redirect=\${encodeURIComponent(redirect)}\`);
      return;
    }
    try {
      const session = { access_token: firebaseToken };`;

const replacement = `    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js');
      const { getAuth, onAuthStateChanged, getIdToken, signOut } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js');
      
      const resConfig = await fetch('/firebase-applet-config.json');
      const firebaseConfig = await resConfig.json();
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      
      window.__firebaseAuth = auth;
      window.__firebaseSignOut = signOut;

      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          const redirect = \`\${window.location.pathname.split('/').pop() || 'index.html'}\${window.location.search}\`;
          if (!window.location.pathname.includes('login.html')) {
            window.location.replace(\`login.html?redirect=\${encodeURIComponent(redirect)}\`);
          }
          return;
        }
        
        try {
          const firebaseToken = await getIdToken(user);
          const session = { access_token: firebaseToken };`;

code = code.replace(targetToReplace, replacement);

// We added `onAuthStateChanged(auth, async (user) => {` and `try {`, meaning we added two nested blocks.
// Wait, the original code had a `try {` block that ends at line 305 with `} catch (error) { ... }`.
// So we just need to append `});` to close `onAuthStateChanged` after the `catch` block.

const endTarget = `      document.documentElement.dataset.dwjPortalState = 'blocked';
      setStatus('Gagal memuat akun', 'error');
       showBlocked('Data belum dapat dimuat', error.message || 'Periksa koneksi dan konfigurasi API.', { showLogin: Boolean(error.authRequired) });
    }
  };`;

const endReplacement = `      document.documentElement.dataset.dwjPortalState = 'blocked';
      setStatus('Gagal memuat akun', 'error');
       showBlocked('Data belum dapat dimuat', error.message || 'Periksa koneksi dan konfigurasi API.', { showLogin: Boolean(error.authRequired) });
    }
  }); // end onAuthStateChanged
  } catch (initErr) {
      document.documentElement.dataset.dwjPortalState = 'blocked';
      setStatus('Gagal memuat akun', 'error');
      showBlocked('Firebase gagal dimuat', initErr.message);
  }
};`;

code = code.replace(endTarget, endReplacement);
fs.writeFileSync('darussolah-portal.js', code);
