const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const transformKeys = `
function camelize(obj) {
  if (Array.isArray(obj)) return obj.map(camelize);
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        const newKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        result[newKey] = camelize(obj[key]);
      }
    }
    return result;
  }
  return obj;
}

function decamelize(obj) {
  if (Array.isArray(obj)) return obj.map(decamelize);
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        const newKey = key.replace(/[A-Z]/g, letter => \`_\${letter.toLowerCase()}\`);
        result[newKey] = decamelize(obj[key]);
      }
    }
    return result;
  }
  return obj;
}
`;

code = code.replace('// --- Admin Endpoints ---', transformKeys + '\n// --- Admin Endpoints ---');

// Replace standard route bodies to use camelize/decamelize
code = code.replace(/const data = await query;\n    res\.json\(\{ items: data \}\);/g, 'const data = await query;\n    res.json({ items: decamelize(data) });');

code = code.replace(/res\.json\(\{ items: data \}\);/g, 'res.json({ items: decamelize(data) });');

code = code.replace(/const payload = req\.body;/g, 'const payload = camelize(req.body);');
code = code.replace(/const result = await db\.insert\(adminRecords\)\.values\(payload\)\.returning\(\);/g, 'const result = await db.insert(adminRecords).values(payload).returning();');
code = code.replace(/\.set\(req\.body\)/g, '.set(camelize(req.body))');
code = code.replace(/\.values\(req\.body\)/g, '.values(camelize(req.body))');
code = code.replace(/res\.status\(201\)\.json\(result\[0\]\);/g, 'res.status(201).json(decamelize(result[0]));');
code = code.replace(/res\.json\(result\[0\] \|\| \{\}\);/g, 'res.json(decamelize(result[0] || {}));');

fs.writeFileSync('server.ts', code);
