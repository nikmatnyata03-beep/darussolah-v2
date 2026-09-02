const fs = require('fs');
let code = fs.readFileSync('darussolah-portal.js', 'utf8');

code = code.replace("const session = sessionData.session;", "const session = { access_token: firebaseToken };");
code = code.replace(/client/g, "null");

fs.writeFileSync('darussolah-portal.js', code);
