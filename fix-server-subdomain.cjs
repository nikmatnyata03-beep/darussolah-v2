const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /\/\/ Dynamic Sub-Path Routing for Frontends/;
const replacement = `// Middleware to detect subdomain
app.use((req, res, next) => {
  const host = req.headers.host || '';
  const match = host.match(/^(tpq|mdt|ra|rtq)\\./i);
  if (match) {
    req.tenant_subdomain = match[1].toLowerCase();
  }
  next();
});

// Dynamic Sub-Path Routing for Frontends`;

code = code.replace(regex, replacement);

const fallbackRegex = /\/\/ Fallback to index\.html for SPA\s*app\.get\('\*', \(req, res\) => \{\s*res\.sendFile\(path\.join\(__dirname, 'index\.html'\)\);\s*\}\);/;
const fallbackReplacement = `// Fallback routing handling subdomains
app.get('*', (req, res) => {
  if (req.tenant_subdomain) {
    let filePath = path.join(__dirname, 'tenant-landing.html');
    if (req.path === '/pendaftaran.html') filePath = path.join(__dirname, 'tenant-pendaftaran.html');
    
    if (fs.existsSync(filePath)) {
      let html = fs.readFileSync(filePath, 'utf8');
      if (!html.includes('darussolah-tenant-slug')) {
        html = html.replace('</head>', \`<meta name="darussolah-tenant-slug" content="\${req.tenant_subdomain}"></head>\`);
      }
      html = html.replace(/data-institution="[^"]*"/g, \`data-institution="\${req.tenant_subdomain}"\`);
      return res.send(html);
    }
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});`;

code = code.replace(fallbackRegex, fallbackReplacement);
fs.writeFileSync('server.ts', code);
console.log('Server updated for subdomain detection');
