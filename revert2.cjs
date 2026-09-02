const fs = require('fs');
let code = fs.readFileSync('darussolah-portal.js', 'utf8');

code = code.replace(/addSignOut\(null\);/g, 'addSignOut(null);'); // this is fine since it doesn't use client anymore
code = code.replace(/null, config, session, context/g, 'null, config, session, context');
fs.writeFileSync('darussolah-portal.js', code);
