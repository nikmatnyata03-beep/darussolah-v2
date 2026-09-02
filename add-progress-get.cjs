const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const getProgress = `
app.get('/v1/private/:tenant_slug/admin/progress', requireAuth, async (req, res) => {
  try {
    const data = await db.select().from(studentProgress);
    res.json({ items: decamelize(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
`;

// Insert it right before POST progress
code = code.replace(/app\.post\('\/v1\/private\/:tenant_slug\/admin\/progress'/g, getProgress.trim() + "\n\napp.post('/v1/private/:tenant_slug/admin/progress'");

fs.writeFileSync('server.ts', code);
console.log('Added GET /admin/progress route');
