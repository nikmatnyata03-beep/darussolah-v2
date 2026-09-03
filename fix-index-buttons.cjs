const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  '<button class="unit-link" type="button" data-open="admission" data-unit="TPQ Darul Jinan">Pilih program <span class="arrow">&#8594;</span></button>',
  '<a class="unit-link" href="/tpq/pendaftaran.html" style="text-decoration:none; display:inline-block;">Pilih program <span class="arrow">&#8594;</span></a>'
);
code = code.replace(
  '<button class="unit-link" type="button" data-open="admission" data-unit="MDT Darussolah">Pilih program <span class="arrow">&#8594;</span></button>',
  '<a class="unit-link" href="/mdt/pendaftaran.html" style="text-decoration:none; display:inline-block;">Pilih program <span class="arrow">&#8594;</span></a>'
);
code = code.replace(
  '<button class="unit-link" type="button" data-open="admission" data-unit="RA Darussolah">Pilih program <span class="arrow">&#8594;</span></button>',
  '<a class="unit-link" href="/ra/pendaftaran.html" style="text-decoration:none; display:inline-block;">Pilih program <span class="arrow">&#8594;</span></a>'
);
code = code.replace(
  '<button class="unit-link" type="button" data-open="admission" data-unit="RTQ Darussolah">Pilih program <span class="arrow">&#8594;</span></button>',
  '<a class="unit-link" href="/rtq/pendaftaran.html" style="text-decoration:none; display:inline-block;">Pilih program <span class="arrow">&#8594;</span></a>'
);

fs.writeFileSync('index.html', code);
console.log('Fixed unit links in index');
