const fs = require('fs');
let code = fs.readFileSync('darussolah-portal.js', 'utf8');

code = code.replace(/const addSignOut = null => \{/, 'const addSignOut = client => {');
code = code.replace(/await null\.auth\.signOut\(\);/, 'localStorage.removeItem("dwj-access-token"); window.location.href="login.html";');
code = code.replace(/const requestPrivate = async \(null, suffix, session, options = \{\}\) => \{/, 'const requestPrivate = async (client, suffix, session, options = {}) => {');
code = code.replace(/const current = await null\?\.auth\?\.getSession\?\(\);/, 'const current = null;');
code = code.replace(/const refreshedSession = await null\.auth\.refreshSession\(\);/, 'const refreshedSession = { data: { session: null } };');
code = code.replace(/const fetchPrivate = \(null, suffix, session\) => requestPrivate\(null, suffix, session\);/, 'const fetchPrivate = (client, suffix, session) => requestPrivate(client, suffix, session);');

fs.writeFileSync('darussolah-portal.js', code);
