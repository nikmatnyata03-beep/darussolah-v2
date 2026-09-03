const fs = require('fs');
let html = fs.readFileSync('login.html', 'utf8');

const loginSlugFix = `
    const metaSlug = document.querySelector('meta[name="darussolah-tenant-slug"]')?.content;
    let pathSlug = '';
    const pathParts = window.location.pathname.split('/');
    if (pathParts.length > 1 && ['tpq', 'mdt', 'ra', 'rtq'].includes(pathParts[1])) {
      pathSlug = pathParts[1];
    }
    const tenantSlug = String(metaSlug || config.tenantSlug || pathSlug || 'tpq').trim();
`;

html = html.replace(/const metaSlug = document.querySelector\('meta\[name="darussolah-tenant-slug"\]'\)\?.content;\n\s*const tenantSlug = String\(metaSlug \|\| config.tenantSlug \|\| 'tpq'\).trim\(\);/, loginSlugFix);
fs.writeFileSync('login.html', html);
console.log('Fixed login slug');
