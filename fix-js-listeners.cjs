const fs = require('fs');
let js = fs.readFileSync('darussolah-institution-site.js', 'utf8');

js = js.replace(
  /\$\('#registration'\)\.addEventListener\('submit',/g,
  "const regForm = $('#registration');\nif (regForm) regForm.addEventListener('submit',"
);

js = js.replace(
  /\$\('#login'\)\.addEventListener\('submit',/g,
  "const logForm = $('#login');\nif (logForm) logForm.addEventListener('submit',"
);

fs.writeFileSync('darussolah-institution-site.js', js);
console.log('Fixed listeners in darussolah-institution-site.js');
