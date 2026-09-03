const fs = require('fs');
let js = fs.readFileSync('editor.js', 'utf8');
if (!js.includes('clone.querySelectorAll(\'.modal\').forEach(m => m.hidden = true)')) {
  js = js.replace(
    /const finalHtml =/g,
    `clone.querySelectorAll('.modal').forEach(m => { m.hidden = true; });\n            const finalHtml =`
  );
  fs.writeFileSync('editor.js', js);
}
console.log('Fixed editor modal save');
