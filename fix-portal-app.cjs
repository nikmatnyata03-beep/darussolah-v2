const fs = require('fs');
let code = fs.readFileSync('darussolah-portal.js', 'utf8');
code = code.replace(
  `const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js');`,
  `const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js');`
);
code = code.replace(
  `const app = initializeApp(firebaseConfig);`,
  `const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();`
);
fs.writeFileSync('darussolah-portal.js', code);
