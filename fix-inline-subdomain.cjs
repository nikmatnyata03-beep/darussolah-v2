const fs = require('fs');

function fix(file) {
  let code = fs.readFileSync(file, 'utf8');
  const regex = /const tenantSlug = document\.documentElement\.dataset\.tenant \|\| document\.querySelector\('meta\[name="darussolah-tenant-slug"\]'\)\?\.content \|\| document\.body\.dataset\.institution;/;
  const replacement = `let tenantSlug = document.documentElement.dataset.tenant || document.querySelector('meta[name="darussolah-tenant-slug"]')?.content || document.body.dataset.institution;
        const hostParts = window.location.hostname.split('.');
        if (hostParts.length > 0) {
          const sub = hostParts[0].toLowerCase();
          if (['tpq', 'mdt', 'ra', 'rtq'].includes(sub)) {
            tenantSlug = sub;
          }
        }`;
  
  if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync(file, code);
    console.log('Fixed inline in', file);
  }
}

fix('tenant-pendaftaran.html');
