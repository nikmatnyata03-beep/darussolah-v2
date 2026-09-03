const fs = require('fs');
let code = fs.readFileSync('tenant-pendaftaran.html', 'utf8');

code = code.replace(
  /el\.style\.height = ''; el\.style\.border = '1px solid #cbd5e1'; el\.style\.padding = '10px 12px';/,
  "el.style.height = ''; el.style.border = ''; el.style.padding = '';"
);

fs.writeFileSync('tenant-pendaftaran.html', code);
console.log('Fixed inline style form skeleton');
