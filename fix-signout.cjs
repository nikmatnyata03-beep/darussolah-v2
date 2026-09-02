const fs = require('fs');
let code = fs.readFileSync('darussolah-portal.js', 'utf8');

code = code.replace(/localStorage\.removeItem\("dwj-access-token"\); window\.location\.href="login.html";/, 
  'if (window.__firebaseAuth && window.__firebaseSignOut) { await window.__firebaseSignOut(window.__firebaseAuth); } window.location.href="login.html";');

fs.writeFileSync('darussolah-portal.js', code);
