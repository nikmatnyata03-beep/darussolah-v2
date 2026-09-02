const fs = require('fs');

const files = {
  'keuangan.html': /document\.querySelectorAll\('\[data-action\]'\)\.forEach\(.*?\}\)\);/s,
  'nilai.html': /document\.querySelectorAll\('\.btn-primary'\)\.forEach\(.*?\}\)\);/s,
  'materi.html': /document\.querySelectorAll\('\[data-review\]'\)\.forEach\(\(button\) => \{.*?\},\s*true\)\);/s
};

for (const [filename, regex] of Object.entries(files)) {
  if (fs.existsSync(filename)) {
    let code = fs.readFileSync(filename, 'utf8');
    code = code.replace(regex, '');
    fs.writeFileSync(filename, code);
  }
}
