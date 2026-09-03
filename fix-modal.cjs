const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/data-open="bio-modal-1"/g, 'data-open="bio-1"');
html = html.replace(/data-open="bio-modal-2"/g, 'data-open="bio-2"');
html = html.replace(/data-open="bio-modal-3"/g, 'data-open="bio-3"');
html = html.replace(/data-open="bio-modal-4"/g, 'data-open="bio-4"');

html = html.replace(/id="bio-modal-1"/g, 'id="bio-1-modal"');
html = html.replace(/id="bio-modal-2"/g, 'id="bio-2-modal"');
html = html.replace(/id="bio-modal-3"/g, 'id="bio-3-modal"');
html = html.replace(/id="bio-modal-4"/g, 'id="bio-4-modal"');

fs.writeFileSync('index.html', html);
console.log('Fixed modal ids');
