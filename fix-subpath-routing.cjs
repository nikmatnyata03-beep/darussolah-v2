const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const injection = `
// Dynamic Sub-Path Routing for Frontends (e.g., /tpq/santri.html)
app.get('/:tenant_slug([a-z0-9-]+)/:page([a-z0-9-]+\\\\.html)', (req, res, next) => {
  const { tenant_slug, page } = req.params;
  // Exclude api paths
  if (tenant_slug === 'v1' || tenant_slug === 'api') return next();
  
  const filePath = path.join(__dirname, page);
  if (fs.existsSync(filePath)) {
    let html = fs.readFileSync(filePath, 'utf8');
    if (!html.includes('darussolah-tenant-slug')) {
      html = html.replace('</head>', \`<meta name="darussolah-tenant-slug" content="\${tenant_slug}"></head>\`);
    }
    res.send(html);
  } else {
    next();
  }
});
`;

code = code.replace(
    "app.use(express.static(__dirname));",
    "app.use(express.static(__dirname));\n" + injection
);

fs.writeFileSync('server.ts', code);
console.log('Subpath routing added!');
