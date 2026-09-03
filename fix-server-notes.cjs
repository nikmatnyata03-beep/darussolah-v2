const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetDestructure = `      mother_phone,
      documents
    } = req.body;`;
const newDestructure = `      mother_phone,
      documents,
      notes
    } = req.body;`;

content = content.replace(targetDestructure, newDestructure);

const targetInsert = `      documents: JSON.stringify(documents || []),
      applicationNo,`;
const newInsert = `      documents: JSON.stringify(documents || []),
      notes,
      applicationNo,`;

content = content.replace(targetInsert, newInsert);

fs.writeFileSync('server.ts', content);
console.log('Fixed server.ts');
