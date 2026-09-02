const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const endpoints = `
// --- Wali Endpoints ---
app.get('/v1/private/:tenant_slug/wali/dashboard/:student_id', requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.student_id);
    
    // Invoices
    const invData = await db.select().from(invoices).where(eq(invoices.studentId, studentId));
    // Progress
    const progData = await db.select().from(studentProgress).where(eq(studentProgress.studentId, studentId));
    
    res.json({
      invoices: decamelize(invData),
      progress: decamelize(progData)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/wali/leave', requireAuth, async (req, res) => {
  try {
    const payload = camelize(req.body);
    const result = await db.insert(leaveRequests).values(payload).returning();
    res.status(201).json(decamelize(result[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/wali/feedback', requireAuth, async (req, res) => {
  try {
    const payload = camelize(req.body);
    const result = await db.insert(feedbacks).values(payload).returning();
    res.status(201).json(decamelize(result[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/posts', requireAuth, async (req, res) => {
  try {
    const data = await db.select().from(posts);
    res.json({ items: decamelize(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/documents', requireAuth, async (req, res) => {
  try {
    // just returning content that might be documents
    const data = await db.select().from(content).where(eq(content.contentType, 'document'));
    res.json({ items: decamelize(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
`;

if (!code.includes('/wali/leave')) {
  // Add exports for the new tables in drizzle schema first so server can import them
  code = code.replace(
    "import { users, attendance, institutions, students, staff, content, adminRecords } from './src/db/schema.js';",
    "import { users, attendance, institutions, students, staff, content, adminRecords, invoices, studentProgress, leaveRequests, feedbacks, posts } from './src/db/schema.js';"
  );
  
  code = code.replace('// --- Admin Endpoints ---', endpoints + '\n// --- Admin Endpoints ---');
  fs.writeFileSync('server.ts', code);
}
