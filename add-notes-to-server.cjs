const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `      documents
    } = req.body;`,
  `      documents,
      notes
    } = req.body;`
);

code = code.replace(
  `      documents: JSON.stringify(documents || []),
      applicationNo,`,
  `      documents: JSON.stringify(documents || []),
      notes,
      applicationNo,`
);

fs.writeFileSync('server.ts', code);
console.log('Updated server.ts with notes');
