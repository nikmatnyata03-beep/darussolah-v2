const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\('\/v1\/public\/:tenant_slug\/registrations', async \(req, res\) => \{[\s\S]*?res\.status\(201\)\.json\(\{[\s\S]*?\}\);\s*\} catch \(err\) \{/s;

const newRoute = `app.post('/v1/public/:tenant_slug/registrations', async (req, res) => {
  try {
    const { 
      institution_id, 
      registration_type, 
      academic_year, 
      student_full_name, 
      birth_place,
      birth_date,
      gender,
      address,
      father_name,
      mother_name,
      father_phone, 
      mother_phone,
      documents
    } = req.body;
    
    // Generate a simple application number
    const applicationNo = "REG-" + Math.floor(Math.random() * 1000000);
    
    const result = await db.insert(registrations).values({
      institutionId: parseInt(institution_id?.toString().replace(/\\D/g, '') || '0') || null,
      registrationType: registration_type,
      academicYear: academic_year || '2026/2027',
      studentFullName: student_full_name,
      birthPlace: birth_place,
      birthDate: birth_date,
      gender: gender,
      address: address,
      fatherName: father_name,
      motherName: mother_name,
      fatherPhone: father_phone,
      motherPhone: mother_phone,
      documents: JSON.stringify(documents || []),
      applicationNo,
      status: 'pending'
    }).returning();
    
    res.status(201).json({
      id: result[0].id,
      application_no: result[0].applicationNo,
      status: result[0].status
    });
  } catch (err) {`;

if (code.match(regex)) {
  code = code.replace(regex, newRoute);
  fs.writeFileSync('server.ts', code);
  console.log('API fixed');
} else {
  console.log('Regex did not match');
}
