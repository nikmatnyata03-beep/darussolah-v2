const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
    /await db\.insert\(invoices\)\.values\(\{([^}]+)\}\);/,
    "await db.insert(invoices).values({$1, institutionId: req.tenantId});"
);

fs.writeFileSync('server.ts', code);
console.log('Fixed invoices tenant id');
