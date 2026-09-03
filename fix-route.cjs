const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("const { sql } = require('drizzle-orm');", "const { sql } = await import('drizzle-orm');");
fs.writeFileSync('server.ts', code);
console.log('Fixed import');
