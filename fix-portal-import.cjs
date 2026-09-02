const fs = require('fs');
let code = fs.readFileSync('darussolah-portal.js', 'utf8');

code = code.replace(/import \{.*\} from "https:\/\/.*";\n/g, '');

const oldStart = `const start = async () => {
    injectStyles();
    if (!partiallyConfigured) {
      setStatus('Mode demo');
      return;
    }
    if (!allConfigured) {
      setStatus('Konfigurasi belum lengkap', 'error');
      showBlocked('Portal belum siap', 'Isi API URL pada darussolah-config.js.');
      return;
    }
    document.documentElement.dataset.dwjPortalState = 'checking';
    
    try {
      const resConfig = await fetch('/firebase-applet-config.json');
      const firebaseConfig = await resConfig.json();
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      
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
          const session = { access_token: firebaseToken };
          
          window.__firebaseAuth = auth;
          window.__firebaseSignOut = signOut;`;

const newStart = `const start = async () => {
    injectStyles();
    if (!partiallyConfigured) {
      setStatus('Mode demo');
      return;
    }
    if (!allConfigured) {
      setStatus('Konfigurasi belum lengkap', 'error');
      showBlocked('Portal belum siap', 'Isi API URL pada darussolah-config.js.');
      return;
    }
    document.documentElement.dataset.dwjPortalState = 'checking';
    
    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js');
      const { getAuth, onAuthStateChanged, getIdToken, signOut } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js');
      
      const resConfig = await fetch('/firebase-applet-config.json');
      const firebaseConfig = await resConfig.json();
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      
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
          const session = { access_token: firebaseToken };
          
          window.__firebaseAuth = auth;
          window.__firebaseSignOut = signOut;`;

code = code.replace(oldStart, newStart);
fs.writeFileSync('darussolah-portal.js', code);
