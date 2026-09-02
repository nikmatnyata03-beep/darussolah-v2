const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
app.post('/v1/private/:tenant_slug/learning/submissions', requireAuth, async (req, res) => {
  try {
    const payload = camelize(req.body);
    const result = await db.insert(adminRecords).values({
      module: 'submissions',
      recordKey: \`\${payload.resourceId || 'unknown'}:\${payload.studentId || 'unknown'}:\${Date.now()}\`,
      payload: req.body
    }).returning();
    res.json({ success: true, item: { id: result[0].id, ...req.body } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
`;

code = code.replace(`app.post('/v1/private/:tenant_slug/learning/submissions', requireAuth, async (req, res) => {
  res.json({ success: true, item: req.body });
});`, replacement);

fs.writeFileSync('server.ts', code);
