const fs = require('fs');
let code = fs.readFileSync('darussolah-portal.js', 'utf8');

const regex = /tenantSlug: String\(metaValue\('darussolah-tenant-slug'\) \|\| source\.tenantSlug \|\| 'yayasan-darussolah-wal-jinan'\)/;

const replacement = `tenantSlug: (() => {
      let slug = metaValue('darussolah-tenant-slug') || source.tenantSlug;
      const hostParts = window.location.hostname.split('.');
      if (hostParts.length > 0) {
        const sub = hostParts[0].toLowerCase();
        if (['tpq', 'mdt', 'ra', 'rtq'].includes(sub)) {
          slug = sub;
        }
      }
      return String(slug || 'yayasan-darussolah-wal-jinan');
    })()`;

code = code.replace(regex, replacement);
fs.writeFileSync('darussolah-portal.js', code);
console.log('Fixed portal JS properly');
