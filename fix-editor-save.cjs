const fs = require('fs');
let js = fs.readFileSync('editor.js', 'utf8');

js = js.replace(/body: JSON\.stringify\(\{ html: finalHtml \}\)/g, `body: JSON.stringify({ html: finalHtml, pathname: window.location.pathname })`);

fs.writeFileSync('editor.js', js);
console.log('Fixed editor save');
