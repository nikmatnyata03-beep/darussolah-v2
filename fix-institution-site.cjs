const fs = require('fs');
let code = fs.readFileSync('darussolah-institution-site.js', 'utf8');

// Change `const site = SITES[code];` to `const site = SITES[code] || {};`
code = code.replace("const site = SITES[code];", "const site = SITES[code] || { name: 'Lembaga', type: 'Pendidikan', slug: code, logo: '', quote: '', about: '', features: [], posts: [] };");

// Remove the `throw new Error` line
code = code.replace("if (!site) throw new Error(`Unknown institution: ${code}`);", "if (!code) console.warn('No institution code provided');");

fs.writeFileSync('darussolah-institution-site.js', code);
console.log('Fixed institution site JS fallback');
