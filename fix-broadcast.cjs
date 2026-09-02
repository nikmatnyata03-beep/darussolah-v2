const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldBroadcast = /app\.post\('\/v1\/private\/:tenant_slug\/admin\/broadcasts', requireAuth, async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: 'Internal Server Error' \}\);\s*\}\s*\}\);/g;

const newBroadcast = `app.post('/v1/private/:tenant_slug/admin/broadcasts', requireAuth, async (req, res) => {
  try {
    const { target, mode, channel, title, message } = req.body;
    
    await db.insert(posts).values({
      title: title,
      postType: 'broadcast',
      excerpt: message || (mode + ' via ' + channel + ' to ' + target),
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});`;

if (oldBroadcast.test(code)) {
  code = code.replace(oldBroadcast, newBroadcast);
  fs.writeFileSync('server.ts', code);
  console.log("Broadcast endpoint patched.");
}
