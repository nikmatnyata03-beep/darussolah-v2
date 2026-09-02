const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace inline requires
code = code.replace(/const { invoices } = require\('\.\/src\/db\/schema\.ts'\);/g, '');
code = code.replace(/const { studentProgress } = require\('\.\/src\/db\/schema\.ts'\);/g, '');

// Add to imports
code = code.replace(
  "import { attendance, registrations, foundations, institutions, posts, users, learningSubmissions, students, staff, content, adminRecords } from './src/db/schema.ts';", 
  "import { attendance, registrations, foundations, institutions, posts, users, learningSubmissions, students, staff, content, adminRecords, invoices, studentProgress, leaveRequests, feedbacks } from './src/db/schema.ts';"
);

fs.writeFileSync('server.ts', code);
console.log('imports fixed');
