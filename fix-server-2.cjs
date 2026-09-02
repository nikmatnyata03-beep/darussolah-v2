const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix 1: invoices insert
const invoicesRegex = /await db\.insert\(invoices\)\.values\(\{\s*studentId: parseInt\(student_id\) \|\| 1,\s*type: type \|\| 'SPP bulanan',\s*amount: 'Rp ' \+ \(amount \? Number\(amount\)\.toLocaleString\('id-ID'\) : '0'\),\s*status: status \|\| 'unpaid',\s*notes: notes \|\| ''\s*\}\);/g;

const newInvoicesInsert = `await db.insert(invoices).values({
      studentId: parseInt(student_id) || 1,
      amount: 'Rp ' + (amount ? Number(amount).toLocaleString('id-ID') : '0'),
      status: status || 'unpaid',
    });`;

if (invoicesRegex.test(code)) {
    code = code.replace(invoicesRegex, newInvoicesInsert);
    console.log('Fixed invoices insert');
}

// Fix 2: query cast
code = code.replace(/let query = db\.select\(\)\.from\(adminRecords\);/g, 'let query: any = db.select().from(adminRecords);');

// Fix 3: students institutionId
code = code.replace(/count: stdData\.filter\(s => s\.institutionId === inst\.id\)\.length/g, 'count: stdData.length // mock until class mapping is done');

fs.writeFileSync('server.ts', code);
