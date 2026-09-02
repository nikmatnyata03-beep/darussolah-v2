const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldLeave = /app\.post\('\/v1\/private\/:tenant_slug\/wali\/leave', requireAuth, async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: 'Internal Server Error' \}\);\s*\}\s*\}\);/g;

const newLeave = `app.post('/v1/private/:tenant_slug/wali/leave', requireAuth, async (req, res) => {
  try {
    const payload = camelize(req.body);
    if (payload.studentId) {
       payload.studentId = parseInt(payload.studentId);
    }
    const result = await db.insert(leaveRequests).values(payload).returning();
    res.status(201).json(decamelize(result[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});`;

if (oldLeave.test(code)) {
  code = code.replace(oldLeave, newLeave);
  fs.writeFileSync('server.ts', code);
  console.log("Leave route patched.");
}
