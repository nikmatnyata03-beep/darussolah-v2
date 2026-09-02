const fs = require('fs');
let code = fs.readFileSync('materi.html', 'utf8');

code = code.replace(/card\.innerHTML = \\`([\s\S]*?)\\`;/g, 'card.innerHTML = `$1`;');
code = code.replace(/\\\$\{/g, '${');

fs.writeFileSync('materi.html', code);
