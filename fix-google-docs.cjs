const fs = require('fs');
let code = fs.readFileSync('google-docs.js', 'utf8');

code = code.replace(
  `import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';`,
  `import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';`
);

code = code.replace(
  `  const app = initializeApp(config);`,
  `  const app = !getApps().length ? initializeApp(config) : getApp();`
);

fs.writeFileSync('google-docs.js', code);
