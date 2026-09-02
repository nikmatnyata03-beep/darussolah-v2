const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const missingLearningPost = `
app.post('/v1/private/:tenant_slug/learning', requireAuth, async (req, res) => {
  try {
    const payload = camelize(req.body);
    // Dummy insert to adminRecords just to store it for now
    await db.insert(adminRecords).values({
      module: 'learning',
      recordKey: \`\${payload.classId || 'default'}:\${Date.now()}\`,
      payload: req.body
    });
    res.json({ success: true, item: req.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/learning/submissions', requireAuth, async (req, res) => {
  res.json({ success: true, item: req.body });
});
`;

code = code.replace("app.get('/v1/private/:tenant_slug/learning/submissions', requireAuth, async (req, res) => { res.json({ items: [] }); });", 
  "app.get('/v1/private/:tenant_slug/learning/submissions', requireAuth, async (req, res) => { res.json({ items: [] }); });" + missingLearningPost);

fs.writeFileSync('server.ts', code);
