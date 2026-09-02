const fs = require('fs');
let code = fs.readFileSync('darussolah-portal.js', 'utf8');

const target = `      if (document.body.dataset.portalPage === 'attendance' && primaryClass) {`;
const replacement = `      if ((document.body.dataset.portalPage === 'attendance' || role === 'wali') && primaryClass) {`;

code = code.replace(target, replacement);

fs.writeFileSync('darussolah-portal.js', code);
