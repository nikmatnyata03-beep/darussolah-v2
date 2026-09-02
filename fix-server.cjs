const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix 1: req.user
code = code.replace(/req\.user/g, '(req as any).user');

// Fix 2: camelize/decamelize implicit any
code = code.replace(/function camelize\(obj\) \{/g, 'function camelize(obj: any): any {');
code = code.replace(/function decamelize\(obj\) \{/g, 'function decamelize(obj: any): any {');

// Fix 3: Property 'records' does not exist on type '{}' (in /wali/dashboard/:student_id)
// We already have `const payload = record.payload || {}; const records = payload.records || [];`
code = code.replace(/const payload = record\.payload \|\| \{\};/g, 'const payload: any = record.payload || {};');

// Fix 4: Property 'institutionId' does not exist on type ...
// The error is in `/admin/students`? Let's check where `institutionId` is used.
fs.writeFileSync('server.ts', code);
