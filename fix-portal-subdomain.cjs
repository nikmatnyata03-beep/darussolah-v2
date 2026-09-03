const fs = require('fs');
let code = fs.readFileSync('darussolah-portal.js', 'utf8');

const regex = /let tenantSlug = tenantSlugMeta \|\| 'yayasan-darussolah-wal-jinan';/;
const replacement = `let tenantSlug = tenantSlugMeta;
const hostParts = window.location.hostname.split('.');
if (hostParts.length > 0) {
  const sub = hostParts[0].toLowerCase();
  if (['tpq', 'mdt', 'ra', 'rtq'].includes(sub)) {
    tenantSlug = sub;
  }
}
tenantSlug = tenantSlug || 'yayasan-darussolah-wal-jinan';`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('darussolah-portal.js', code);
  console.log('Fixed portal JS');
} else {
  console.log('Regex not found in portal JS');
}
