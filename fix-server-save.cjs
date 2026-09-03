const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newSave = `app.post('/api/page/save', express.json({limit: '50mb'}), (req, res) => {
  try {
    const { html, pathname } = req.body;
    if (!html) return res.status(400).json({error: 'No HTML provided'});
    
    let filename = 'index.html';
    if (pathname && (pathname.includes('/tpq') || pathname.includes('/mdt') || pathname.includes('/ra') || pathname.includes('/rtq'))) {
      if (pathname.includes('pendaftaran.html')) filename = 'tenant-pendaftaran.html';
      else filename = 'tenant-landing.html';
    }
    
    const indexPath = path.join(__dirname, filename);
    
    // Create backup
    if (fs.existsSync(indexPath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.copyFileSync(indexPath, path.join(BACKUP_DIR, \`\${filename}-\${timestamp}.html\`));
    }
    
    // Save new html
    fs.writeFileSync(indexPath, html, 'utf8');
    res.json({success: true});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Failed to save page'});
  }
});`;

code = code.replace(/app\.post\('\/api\/page\/save', express\.json\(\{limit: '50mb'\}\), \(req, res\) => \{[\s\S]*?\}\);\n/, newSave + '\n');
fs.writeFileSync('server.ts', code);
console.log('Fixed server save');
