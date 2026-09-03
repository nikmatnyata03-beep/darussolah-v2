const fs = require('fs');
const files = [
  'darussolah-wal-jinan.html',
  'darussolah-portal.js',
  'darussolah-config.js',
  'login.html'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/yayasan-darussolah-wal-jinan/g, 'darussolah');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
