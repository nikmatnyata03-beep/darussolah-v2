const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');

index = index.replace(
  '<div class="unit-seal" aria-hidden="true">TPQ</div>',
  '<img class="unit-seal-img" src="darussolah-assets/TPQ darul jinan.jpeg" alt="Logo TPQ Darul Jinan">'
);
index = index.replace(
  '<div class="unit-seal" aria-hidden="true">MDT</div>',
  '<img class="unit-seal-img" src="darussolah-assets/majelis darussolah.jpeg" alt="Logo MDT Darussolah">'
);
index = index.replace(
  '<div class="unit-seal" aria-hidden="true">RA</div>',
  '<img class="unit-seal-img" src="darussolah-assets/RA darussolah.jpeg" alt="Logo RA Darussolah">'
);
index = index.replace(
  '<div class="unit-seal" aria-hidden="true">RTQ</div>',
  '<img class="unit-seal-img" src="darussolah-assets/RTQ darussolah.jpeg" alt="Logo RTQ Darussolah">'
);

// Add CSS for unit-seal-img
if (!index.includes('.unit-seal-img')) {
  index = index.replace(
    '.unit-seal {',
    '.unit-seal-img { width: 62px; height: 62px; object-fit: contain; border-radius: 12px; background: white; margin-bottom: 24px; display: block; }\n    .unit-seal {'
  );
  // adjust the h3 margin since we replaced the div (the h3 had margin-top: 24px because of absolute/relative stuff, but we can just use margin-bottom on img)
  index = index.replace(
    '.unit-card h3 { margin-top: 24px; margin-bottom: 5px; font-size: 25px; }',
    '.unit-card h3 { margin-top: 0; margin-bottom: 5px; font-size: 25px; }'
  );
}

fs.writeFileSync('index.html', index);

let js = fs.readFileSync('darussolah-institution-site.js', 'utf8');
js = js.replace(/logo:'darussolah-assets\/logo-tpq-darul-jinan\.jpeg'/g, "logo:'darussolah-assets/TPQ darul jinan.jpeg'");
js = js.replace(/logo:'darussolah-assets\/logo-yayasan-darussolah-wal-jinan\.jpeg'/g, "logo:'darussolah-assets/majelis darussolah.jpeg'");
js = js.replace(/logo:'darussolah-assets\/logo-ra-darussolah\.jpeg'/g, "logo:'darussolah-assets/RA darussolah.jpeg'");
js = js.replace(/logo:'darussolah-assets\/logo-rtq-darussolah\.jpeg'/g, "logo:'darussolah-assets/RTQ darussolah.jpeg'");

fs.writeFileSync('darussolah-institution-site.js', js);
console.log('Updated logo paths');
