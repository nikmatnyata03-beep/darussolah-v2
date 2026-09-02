const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
app.put('/v1/private/:tenant_slug/learning/submissions/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await db.select().from(adminRecords).where(eq(adminRecords.id, id)).limit(1);
    if (!existing.length) {
      return res.status(404).json({ error: 'Not Found' });
    }
    const updatedPayload = { ...existing[0].payload, ...req.body };
    await db.update(adminRecords).set({ payload: updatedPayload }).where(eq(adminRecords.id, id));
    res.json({ success: true, item: updatedPayload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
`;

code = code.replace(`app.put('/v1/private/:tenant_slug/learning/submissions/:id', requireAuth, async (req, res) => {
  res.json({ success: true, item: req.body });
});`, replacement);

fs.writeFileSync('server.ts', code);
