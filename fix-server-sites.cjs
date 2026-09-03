const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newSave = `
app.post('/api/tenant/save-content', express.json(), (req, res) => {
  try {
    const { tenant_slug, key, value } = req.body; // key e.g. 'quote' or 'about'
    if (!tenant_slug || !key || !value) return res.status(400).json({error: 'Missing data'});
    
    const jsPath = path.join(__dirname, 'darussolah-institution-site.js');
    let js = fs.readFileSync(jsPath, 'utf8');
    
    // Simple replacement for SITES
    // SITES looks like: tpq: {name:'...', slug:'tpq', type:'...', quote:'...', about:'...',
    const regex = new RegExp(\`(\${tenant_slug}:\\\\s*\\\\{[^}]*?\${key}:\\\\s*')([^']*)(')\`);
    if (regex.test(js)) {
      js = js.replace(regex, (match, p1, p2, p3) => p1 + value.replace(/'/g, "\\\\'") + p3);
      fs.writeFileSync(jsPath, js, 'utf8');
      return res.json({success: true});
    }
    res.status(404).json({error: 'Key not found in JS dictionary'});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Failed to save script'});
  }
});
`;

if (!code.includes('/api/tenant/save-content')) {
  code = code.replace(/app\.post\('\/api\/page\/restore'/g, newSave + "\napp.post('/api/page/restore'");
  fs.writeFileSync('server.ts', code);
}
console.log('Added save-content endpoint');
