const fs = require('fs');

function fixPath(file) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace href="style.css" with href="/style.css"
  code = code.replace(/href="darussolah-institution-site\.css"/g, 'href="/darussolah-institution-site.css"');
  code = code.replace(/src="darussolah-config\.js"/g, 'src="/darussolah-config.js"');
  code = code.replace(/src="darussolah-institution-site\.js"/g, 'src="/darussolah-institution-site.js"');
  code = code.replace(/href="darussolah-portal\.css"/g, 'href="/darussolah-portal.css"');
  code = code.replace(/src="darussolah-portal\.js"/g, 'src="/darussolah-portal.js"');
  code = code.replace(/src="editor\.js"/g, 'src="/editor.js"');
  code = code.replace(/href="login\.html"/g, 'href="login.html"'); // keep login relative if possible, wait no.
  // Actually, keeping href="login.html" relative to /tpq/ is correct so it goes to /tpq/login.html
  // But assets need absolute /
  
  fs.writeFileSync(file, code);
}

fixPath('tenant-landing.html');
fixPath('tenant-pendaftaran.html');
fixPath('login.html'); // wait, login.html is used at root and subpath? The subpath route serves the root login.html!

console.log('Fixed asset paths');
