const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

if (!html.includes('editor.js')) {
  html = html.replace('</body>', '  <script src="editor.js"></script>\n</body>');
  fs.writeFileSync('index.html', html);
}
