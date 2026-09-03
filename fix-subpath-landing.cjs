const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /if \(page === 'index\.html'\) filePath = path\.join\(__dirname, 'tenant-landing\.html'\);/s;
const replacement = `if (page === 'index.html') filePath = path.join(__dirname, 'tenant-landing.html');\n  if (page === 'pendaftaran.html') filePath = path.join(__dirname, 'tenant-pendaftaran.html');`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('server.ts', code);
  console.log('pendaftaran routing fixed');
} else {
  console.log('Regex failed');
}
