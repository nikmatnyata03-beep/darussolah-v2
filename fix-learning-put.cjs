const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const missingPut = `
app.put('/v1/private/:tenant_slug/learning/submissions/:id', requireAuth, async (req, res) => {
  res.json({ success: true, item: req.body });
});
`;

code = code.replace("app.post('/v1/private/:tenant_slug/learning/submissions', requireAuth, async (req, res) => {", 
  missingPut + "app.post('/v1/private/:tenant_slug/learning/submissions', requireAuth, async (req, res) => {");

fs.writeFileSync('server.ts', code);
