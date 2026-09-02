const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const builderEndpoints = `
// --- Visual Builder Endpoints ---
const BACKUP_DIR = path.join(__dirname, 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

app.post('/api/page/save', express.json({limit: '50mb'}), (req, res) => {
  try {
    const { html } = req.body;
    if (!html) return res.status(400).json({error: 'No HTML provided'});
    
    const indexPath = path.join(__dirname, 'index.html');
    
    // Create backup
    if (fs.existsSync(indexPath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.copyFileSync(indexPath, path.join(BACKUP_DIR, \`index-\${timestamp}.html\`));
    }
    
    // Save new html
    fs.writeFileSync(indexPath, html, 'utf8');
    res.json({success: true});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Failed to save page'});
  }
});

app.get('/api/page/backups', (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('index-') && f.endsWith('.html'));
    // Sort descending by timestamp
    files.sort((a, b) => b.localeCompare(a));
    res.json({ backups: files });
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Failed to list backups'});
  }
});

app.post('/api/page/restore', express.json(), (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({error: 'No filename provided'});
    
    const backupPath = path.join(BACKUP_DIR, filename);
    const indexPath = path.join(__dirname, 'index.html');
    
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({error: 'Backup not found'});
    }
    
    // Backup current before restoring
    if (fs.existsSync(indexPath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.copyFileSync(indexPath, path.join(BACKUP_DIR, \`index-\${timestamp}-prerestore.html\`));
    }
    
    fs.copyFileSync(backupPath, indexPath);
    res.json({success: true});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Failed to restore backup'});
  }
});
`;

if (!code.includes('/api/page/save')) {
  code = code.replace('// Serve static frontend files', builderEndpoints + '\n// Serve static frontend files');
  fs.writeFileSync('server.ts', code);
}
