const fs = require('fs');
let code = fs.readFileSync('tenant-pendaftaran.html', 'utf8');

code = code.replace(
  /document\.getElementById\('program-pendidikan'\)\.value = instName;/,
  "const el = document.getElementById('program-pendidikan'); el.value = instName; el.classList.remove('skeleton-block'); el.style.height = ''; el.style.border = '1px solid #cbd5e1'; el.style.padding = '10px 12px';"
);

fs.writeFileSync('tenant-pendaftaran.html', code);
console.log('Fixed form skeleton');
