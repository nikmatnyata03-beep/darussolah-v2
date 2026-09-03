const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Replace anchor links to actual tenant paths
code = code.replace(/<a href="#lembaga">TPQ Darul Jinan<\/a>/g, '<a href="/tpq/">TPQ Darul Jinan</a>');
code = code.replace(/<a href="#lembaga">MDT Darussolah<\/a>/g, '<a href="/mdt/">MDT Darussolah</a>');
code = code.replace(/<a href="#lembaga">RA Darussolah<\/a>/g, '<a href="/ra/">RA Darussolah</a>');
code = code.replace(/<a href="#lembaga">RTQ Darussolah<\/a>/g, '<a href="/rtq/">RTQ Darussolah</a>');

fs.writeFileSync('index.html', code);
console.log('Fixed index links');
