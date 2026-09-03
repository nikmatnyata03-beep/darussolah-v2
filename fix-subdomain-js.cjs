const fs = require('fs');
let code = fs.readFileSync('darussolah-institution-site.js', 'utf8');

const regex = /const code = document\.body\.dataset\.institution;/;
const replacement = `let detectedSubdomain = null;
const hostParts = window.location.hostname.split('.');
if (hostParts.length > 0) {
  const sub = hostParts[0].toLowerCase();
  if (['tpq', 'mdt', 'ra', 'rtq'].includes(sub)) {
    detectedSubdomain = sub;
  }
}
const code = detectedSubdomain || document.body.dataset.institution || document.querySelector('meta[name="darussolah-tenant-slug"]')?.content;`;

code = code.replace(regex, replacement);
fs.writeFileSync('darussolah-institution-site.js', code);
console.log('Fixed JS subdomain detection');
