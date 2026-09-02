const fs = require('fs');
let code = fs.readFileSync('darussolah-portal.js', 'utf8');

code = code.replace(
  "const allConfigured = Boolean(config.apiBase && config.supabaseUrl && config.supabaseAnonKey);",
  "const allConfigured = Boolean(config.apiBase);"
);

code = code.replace(
  "const partiallyConfigured = Boolean(config.apiBase || config.supabaseUrl || config.supabaseAnonKey);",
  "const partiallyConfigured = Boolean(config.apiBase);"
);

const startRegex = /const start = async \(\) => \{[\s\S]*?if \(!sessionData\.session\) \{/m;

const newStartCode = `const start = async () => {
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
    
    // Read Firebase token from localStorage
    const firebaseToken = localStorage.getItem('dwj-access-token');
    if (!firebaseToken) {
`;

code = code.replace(startRegex, newStartCode);
fs.writeFileSync('darussolah-portal.js', code);
