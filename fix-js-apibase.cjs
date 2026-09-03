const fs = require('fs');
let js = fs.readFileSync('darussolah-institution-site.js', 'utf8');

js = js.replace(/if \(!apiBase\) \{\s*applyFallbackDetail\(\);\s*renderPosts\(\);\s*return;\s*\}/, `console.log("Hydrating API with base:", apiBase || "relative");`);

// Add console log to fetchJson
js = js.replace(
  `const fetchJson = async path => { const response = await fetch(\`\${apiBase}/v1/public/\${TENANT}/\${path}\`); if (!response.ok) throw new Error(\`HTTP \${response.status}\`); return response.json(); };`,
  `const fetchJson = async path => { 
  const url = \`\${apiBase}/v1/public/\${TENANT}/\${path}\`;
  console.log("Fetching API:", url);
  const response = await fetch(url); 
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`); 
  const data = await response.json();
  console.log("API Response [" + path + "]:", data);
  return data;
};`
);

fs.writeFileSync('darussolah-institution-site.js', js);
console.log('Fixed darussolah-institution-site.js');
