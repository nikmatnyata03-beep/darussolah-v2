const fs = require('fs');
const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

let hasError = false;
for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g);
  let scriptIndex = 0;
  for (const match of matches) {
    const scriptContent = match[1].trim();
    if (scriptContent) {
      const tmpFile = `tmp_${file}_${scriptIndex}.js`;
      fs.writeFileSync(tmpFile, scriptContent);
      try {
        require('child_process').execSync(`node -c ${tmpFile}`, { stdio: 'ignore' });
      } catch (e) {
        console.error(`Syntax error in ${file} (script index ${scriptIndex})`);
        hasError = true;
      }
      fs.unlinkSync(tmpFile);
    }
    scriptIndex++;
  }
}
if (!hasError) console.log('All inline scripts passed syntax check.');
