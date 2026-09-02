const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const getInvoices = `
app.get('/v1/private/:tenant_slug/admin/invoices', requireAuth, async (req, res) => {
  try {
    const data = await db.select().from(invoices);
    // Also fetch students so we can map names
    const stdData = await db.select().from(students);
    const enriched = data.map(inv => {
      const st = stdData.find(s => s.id === inv.studentId);
      return {
        ...inv,
        student_name: st ? st.fullName : 'Santri tidak diketahui'
      };
    });
    res.json({ items: decamelize(enriched) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
`;

code = code.replace(/app\.post\('\/v1\/private\/:tenant_slug\/admin\/invoices'/g, getInvoices.trim() + "\n\napp.post('/v1/private/:tenant_slug/admin/invoices'");
fs.writeFileSync('server.ts', code);
console.log('Added GET /admin/invoices route');
