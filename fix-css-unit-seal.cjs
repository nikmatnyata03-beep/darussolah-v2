const fs = require('fs');
let index = fs.readFileSync('index.html', 'utf8');

index = index.replace(
  '.unit-card.ra .unit-seal-img { width: 62px; height: 62px; object-fit: contain; border-radius: 12px; background: white; margin-bottom: 24px; display: block; }\n    .unit-seal { color: var(--white); background: var(--plum); }',
  '.unit-card.ra .unit-seal { color: var(--white); background: var(--plum); }'
);

if (!index.includes('.unit-seal-img { width: 62px;')) {
  index = index.replace(
    '.unit-seal { position: relative;',
    '.unit-seal-img { width: 80px; height: 80px; object-fit: contain; border-radius: 12px; background: white; margin-bottom: 24px; display: block; }\n    .unit-seal { position: relative;'
  );
}

fs.writeFileSync('index.html', index);
console.log('Fixed CSS');
