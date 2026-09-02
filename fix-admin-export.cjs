const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/students: stdData,/g, 'students: decamelize(stdData),');
code = code.replace(/staff: stfData,/g, 'staff: decamelize(stfData),');
code = code.replace(/records: recData,/g, 'records: decamelize(recData),');
code = code.replace(/content: cntData/g, 'content: decamelize(cntData)');

fs.writeFileSync('server.ts', code);
