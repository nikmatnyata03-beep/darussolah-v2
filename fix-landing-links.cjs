const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  '<a class="unit-link" href="/tpq/pendaftaran.html" style="text-decoration:none; display:inline-block;">Pilih program <span class="arrow">&#8594;</span></a>',
  '<a class="unit-link" href="/tpq/" style="text-decoration:none; display:inline-block;">Kunjungi Lembaga <span class="arrow">&#8594;</span></a>'
);
code = code.replace(
  '<a class="unit-link" href="/mdt/pendaftaran.html" style="text-decoration:none; display:inline-block;">Pilih program <span class="arrow">&#8594;</span></a>',
  '<a class="unit-link" href="/mdt/" style="text-decoration:none; display:inline-block;">Kunjungi Lembaga <span class="arrow">&#8594;</span></a>'
);
code = code.replace(
  '<a class="unit-link" href="/ra/pendaftaran.html" style="text-decoration:none; display:inline-block;">Pilih program <span class="arrow">&#8594;</span></a>',
  '<a class="unit-link" href="/ra/" style="text-decoration:none; display:inline-block;">Kunjungi Lembaga <span class="arrow">&#8594;</span></a>'
);
code = code.replace(
  '<a class="unit-link" href="/rtq/pendaftaran.html" style="text-decoration:none; display:inline-block;">Pilih program <span class="arrow">&#8594;</span></a>',
  '<a class="unit-link" href="/rtq/" style="text-decoration:none; display:inline-block;">Kunjungi Lembaga <span class="arrow">&#8594;</span></a>'
);

// Also let's check for <a href="#lembaga"> and replace them if there are any left.
// Just to be safe.
code = code.replace(/<a href="#lembaga">TPQ Darul Jinan<\/a>/g, '<a href="/tpq/">TPQ Darul Jinan</a>');
code = code.replace(/<a href="#lembaga">MDT Darussolah<\/a>/g, '<a href="/mdt/">MDT Darussolah</a>');
code = code.replace(/<a href="#lembaga">RA Darussolah<\/a>/g, '<a href="/ra/">RA Darussolah</a>');
code = code.replace(/<a href="#lembaga">RTQ Darussolah<\/a>/g, '<a href="/rtq/">RTQ Darussolah</a>');


fs.writeFileSync('index.html', code);
console.log('Fixed landing page links to microsites');
