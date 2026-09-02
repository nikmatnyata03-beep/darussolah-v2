const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The original file probably had:
// import path from 'path';
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// We accidentally added it again. Let's deduplicate.
code = code.replace(
  `import express from 'express';\nimport fs from 'fs';\nimport path from 'path';\nimport { fileURLToPath } from 'url';\n\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = path.dirname(__filename);`,
  `import express from 'express';\nimport fs from 'fs';`
);

fs.writeFileSync('server.ts', code);
