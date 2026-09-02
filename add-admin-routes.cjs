const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const adminRoutes = `
// --- Admin Endpoints ---

app.get('/v1/private/:tenant_slug/admin/records', requireAuth, async (req, res) => {
  try {
    const moduleName = req.query.module;
    let query = db.select().from(adminRecords);
    if (moduleName) {
      query = query.where(eq(adminRecords.module, String(moduleName)));
    }
    const data = await query;
    res.json({ items: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/admin/records', requireAuth, async (req, res) => {
  try {
    const payload = req.body;
    const result = await db.insert(adminRecords).values(payload).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/v1/private/:tenant_slug/admin/records/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.update(adminRecords)
      .set(req.body)
      .where(eq(adminRecords.id, id))
      .returning();
    res.json(result[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/admin/students', requireAuth, async (req, res) => {
  try {
    const data = await db.select().from(students);
    res.json({ items: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/admin/students', requireAuth, async (req, res) => {
  try {
    const result = await db.insert(students).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/admin/staff', requireAuth, async (req, res) => {
  try {
    const data = await db.select().from(staff);
    res.json({ items: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/admin/staff', requireAuth, async (req, res) => {
  try {
    const result = await db.insert(staff).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/admin/content', requireAuth, async (req, res) => {
  try {
    const data = await db.select().from(content);
    res.json({ items: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/admin/content', requireAuth, async (req, res) => {
  try {
    const result = await db.insert(content).values(req.body).returning();
    res.status(201).json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/v1/private/:tenant_slug/admin/content/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.update(content).set(req.body).where(eq(content.id, id)).returning();
    res.json(result[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/admin/summary', requireAuth, async (req, res) => {
  try {
    const stdData = await db.select().from(students);
    const stfData = await db.select().from(staff);
    res.json({
      students_total: stdData.length,
      teachers_active: stfData.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/admin/export', requireAuth, async (req, res) => {
  try {
    const stdData = await db.select().from(students);
    const stfData = await db.select().from(staff);
    const recData = await db.select().from(adminRecords);
    const cntData = await db.select().from(content);
    res.json({
      timestamp: new Date().toISOString(),
      students: stdData,
      staff: stfData,
      records: recData,
      content: cntData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

`;

code = code.replace('// Serve static frontend files', adminRoutes + '\n// Serve static frontend files');

fs.writeFileSync('server.ts', code);
