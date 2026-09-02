const fs = require('fs');
let code = fs.readFileSync('darussolah-portal.js', 'utf8');
code = code.replace("null, config, session", "client: null, config, session");
fs.writeFileSync('darussolah-portal.js', code);
