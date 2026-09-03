const fs = require('fs');
let code = fs.readFileSync('darussolah-portal.js', 'utf8');

code = code.replace(
  "tenantSlug: String(source.tenantSlug || 'yayasan-darussolah-wal-jinan')",
  "tenantSlug: String(metaValue('darussolah-tenant-slug') || source.tenantSlug || 'yayasan-darussolah-wal-jinan')"
);

fs.writeFileSync('darussolah-portal.js', code);
console.log('Fixed tenant resolution in portal JS');
