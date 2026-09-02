const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules') walk(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // replace `from './something'` to `from './something.ts'`
      // handle `'` and `"`
      content = content.replace(/from\s+['"](\.[^'"]+)['"]/g, (match, p1) => {
        if (!p1.endsWith('.ts') && !p1.endsWith('.js')) {
          return `from '${p1}.ts'`;
        }
        return match;
      });
      // also replace `import './something'`
      content = content.replace(/import\s+['"](\.[^'"]+)['"]/g, (match, p1) => {
        if (!p1.endsWith('.ts') && !p1.endsWith('.js')) {
          return `import '${p1}.ts'`;
        }
        return match;
      });
      fs.writeFileSync(fullPath, content);
    }
  }
}
walk('.');
console.log('Fixed imports');
