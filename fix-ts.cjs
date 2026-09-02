const fs = require('fs');

let s = fs.readFileSync('server.ts', 'utf8');
s = s.replace(/record\.payload/g, '(record.payload as any)');
s = s.replace(/const newObj = \{\};/g, 'const newObj: any = {};');
s = s.replace(/r => r\.uid/g, '(r: any) => r.uid');
fs.writeFileSync('server.ts', s);

let dbIndex = fs.readFileSync('src/db/index.ts', 'utf8');
dbIndex = dbIndex.replace(/globalThis/g, '(globalThis as any)');
dbIndex = dbIndex.replace(/catch \(err\)/g, 'catch (err: any)');
fs.writeFileSync('src/db/index.ts', dbIndex);

let auth = fs.readFileSync('src/middleware/auth.ts', 'utf8');
auth = auth.replace(/req, res, next/g, 'req: any, res: any, next: any');
fs.writeFileSync('src/middleware/auth.ts', auth);

console.log('Fixed more ts errors');
