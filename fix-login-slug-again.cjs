const fs = require('fs');
let html = fs.readFileSync('login.html', 'utf8');

const loginSlugFix = `
    const metaSlug = document.querySelector('meta[name="darussolah-tenant-slug"]')?.content;
    let pathSlug = '';
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 1 && ['tpq', 'mdt', 'ra', 'rtq'].includes(pathParts[1])) {
      pathSlug = pathParts[1];
    }
    const configSlug = (config.tenantSlug !== 'darussolah' && config.tenantSlug !== 'yayasan-darussolah-wal-jinan') ? config.tenantSlug : null;
    const tenantSlug = String(metaSlug || pathSlug || configSlug || 'tpq').trim();
`;

html = html.replace(/const metaSlug = document\.querySelector\('meta\[name="darussolah-tenant-slug"\]'\)\?\.content;([\s\S]*?)const tenantSlug = String\(metaSlug \|\| config\.tenantSlug \|\| pathSlug \|\| 'tpq'\)\.trim\(\);/, loginSlugFix);
fs.writeFileSync('login.html', html);
console.log('Fixed login slug again');
