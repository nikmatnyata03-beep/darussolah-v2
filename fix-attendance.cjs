const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetToReplace = `app.put('/v1/private/:tenant_slug/attendance', requireAuth, async (req, res) => {
  try {
    const { status, date } = req.body;
    const uid = req.user.uid;
    
    if (!status || !date) {
      return res.status(400).json({ error: 'Status and date required' });
    }

    await db.insert(attendance)
      .values({ uid, status, date })
      .returning();
      
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});`;

const replacement = `app.get('/v1/private/:tenant_slug/attendance', requireAuth, async (req, res) => {
  try {
    const classId = req.query.class_id;
    const date = req.query.attendance_date;
    const recordKey = \`\${classId}:\${date}\`;
    const data = await db.select().from(adminRecords).where(
      and(eq(adminRecords.module, 'attendance'), eq(adminRecords.recordKey, recordKey))
    ).limit(1);
    
    if (data.length) {
      res.json(decamelize(data[0].payload));
    } else {
      res.json({ records: [], close_session: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/v1/private/:tenant_slug/attendance', requireAuth, async (req, res) => {
  try {
    const payload = camelize(req.body);
    const classId = payload.classId;
    const date = payload.attendanceDate;
    const recordKey = \`\${classId}:\${date}\`;
    
    const existing = await db.select().from(adminRecords).where(
      and(eq(adminRecords.module, 'attendance'), eq(adminRecords.recordKey, recordKey))
    ).limit(1);
    
    if (existing.length) {
      await db.update(adminRecords)
        .set({ payload: req.body })
        .where(eq(adminRecords.id, existing[0].id));
    } else {
      await db.insert(adminRecords).values({
        module: 'attendance',
        recordKey: recordKey,
        payload: req.body
      });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});`;

code = code.replace(targetToReplace, replacement);
fs.writeFileSync('server.ts', code);
