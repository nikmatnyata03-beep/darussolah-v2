const fs = require('fs');

// 1. Fix index.html
let index = fs.readFileSync('index.html', 'utf8');
index = index.replace('if (!apiBase) return;', 'console.log("Fetching API using base:", apiBase || "relative");');
index = index.replace('if (apiBase) {\n        window.location.href = \'login.html\';\n        return;\n      }', 'window.location.href = \'login.html\';\n        return;');
// Also add console logs for API response
index = index.replace(
  `const foundation = await foundationResponse.json();
        const institutions = (await institutionsResponse.json()).items || [];`,
  `const foundation = await foundationResponse.json();
        const institutions = (await institutionsResponse.json()).items || [];
        console.log("API Response [foundation]:", foundation);
        console.log("API Response [institutions]:", institutions);`
);

fs.writeFileSync('index.html', index);
console.log('Fixed index.html');

// 2. Fix darussolah-institution-site.js
let js = fs.readFileSync('darussolah-institution-site.js', 'utf8');
js = js.replace(/if \(!apiBase\) \{\s+applyFallbackDetail\(\);\s+renderPosts\(\);\s+return;\s+\}/, `if (false) {\n    // removed apiBase falsy check\n  }`);
// I should make sure it actually replaces correctly. Let me check the exact block.
