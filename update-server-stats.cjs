const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.get('/v1/private/:tenant_slug/admin/summary', requireAuth, async (req, res) => {`;
const insertion = `app.get('/v1/private/:tenant_slug/admin/statistics', requireAuth, async (req, res) => {
  try {
    const stdData = await db.select().from(students);
    const institutionsData = await db.select().from(institutions);
    
    const byInstitution = institutionsData.map(inst => {
      return {
        id: inst.id,
        slug: inst.slug,
        name: inst.name,
        count: stdData.filter(s => s.institutionId === inst.id).length
      };
    });
    
    // Simulate some admissions data for the trend chart
    const admissions = {
      period: '2026 / 2027',
      waves: [
        { name: 'Gel. 1', new: 45, verified: 30 },
        { name: 'Gel. 2', new: 60, verified: 40 },
        { name: 'Gel. 3', new: 80, verified: 55 },
        { name: 'Gel. 4', new: 65, verified: 50 },
      ]
    };
    
    // Simulate attendance trend
    const attendance = {
      target: '≥ 90%',
      current: '93.8%',
      trend: '+2.1%',
      history: [52, 59, 57, 68, 76, 88]
    };
    
    // Simulate emis readiness
    const emis = {
      ready_percent: 86,
      students_ready: true,
      teachers_ready: true,
      classes_ready: false,
      missing_count: 4
    };

    res.json({
      sebaran_santri: byInstitution,
      admissions,
      attendance,
      emis
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
`;

code = code.replace(target, insertion + '\n' + target);
fs.writeFileSync('server.ts', code);
