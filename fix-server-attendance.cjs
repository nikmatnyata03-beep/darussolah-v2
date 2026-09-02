const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const attendanceEndpoint = `
app.post('/v1/private/:tenant_slug/attendance', requireAuth, async (req, res) => {
  try {
    const { class_id, attendance_date, records } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid records' });
    }
    
    // Convert to our attendance schema
    const values = records.map(r => ({
      uid: r.student_id.toString(), // The frontend sends student_id as uid here
      date: attendance_date,
      status: r.status
    }));

    // In a real production app we would do an UPSERT here. 
    // Since this is a simple schema, we just insert.
    await db.insert(attendance).values(values);

    res.json({ success: true, count: values.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
`;

if (!code.includes('app.post(\'/v1/private/:tenant_slug/attendance\'')) {
  code = code.replace('// --- Admin Endpoints ---', attendanceEndpoint + '\n// --- Admin Endpoints ---');
  fs.writeFileSync('server.ts', code);
  console.log("attendance endpoint added");
}
