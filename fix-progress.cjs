const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const progressRegex = /app\.post\('\/v1\/private\/:tenant_slug\/admin\/progress', requireAuth, async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: 'Internal Server Error' \}\);\s*\}\s*\}\);/g;

const newProgress = `app.post('/v1/private/:tenant_slug/admin/progress', requireAuth, async (req, res) => {
  try {
    const { student_id, type, current_value, target, notes, status } = req.body;
    
    // Convert to schema
    const val = {
      studentId: parseInt(student_id),
      currentValue: current_value || type, // save type in currentValue if needed, or target
      target: target,
      notes: notes || (status ? 'Status: ' + status : '')
    };

    await db.insert(studentProgress).values(val);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});`;

if (progressRegex.test(code)) {
  code = code.replace(progressRegex, newProgress);
  fs.writeFileSync('server.ts', code);
  console.log('Fixed progress route');
} else {
  console.log('Progress route not found!');
}
