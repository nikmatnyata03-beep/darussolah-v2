const fs = require('fs');
let js = fs.readFileSync('darussolah-portal.js', 'utf8');

js = js.replace(/let slug = metaValue\('darussolah-tenant-slug'\) \|\| source\.tenantSlug;/, `
      let slug = metaValue('darussolah-tenant-slug');
      if (!slug && source.tenantSlug !== 'darussolah' && source.tenantSlug !== 'yayasan-darussolah-wal-jinan') {
        slug = source.tenantSlug;
      }
`);
fs.writeFileSync('darussolah-portal.js', js);
console.log('Fixed portal slug priority');
