const fs = require('fs');
const content = fs.readFileSync('materi.html', 'utf8');
const matches = [...content.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)];
console.log(matches[6][1]);
