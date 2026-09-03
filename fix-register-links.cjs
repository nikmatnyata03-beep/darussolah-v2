const fs = require('fs');

let tenantCode = fs.readFileSync('tenant-landing.html', 'utf8');
tenantCode = tenantCode.replace(/<button class="primary" data-scroll="register">Daftar Santri<\/button>/g, '<a class="primary button" href="pendaftaran.html" style="display:inline-block;text-decoration:none;">Daftar Santri</a>');
fs.writeFileSync('tenant-landing.html', tenantCode);

console.log('Fixed tenant-landing register buttons');
