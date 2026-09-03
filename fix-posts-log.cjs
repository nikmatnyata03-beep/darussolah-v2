const fs = require('fs');
let index = fs.readFileSync('index.html', 'utf8');

index = index.replace(
  `const postsData = (await postsResponse.json()).items || [];`,
  `const postsData = (await postsResponse.json()).items || [];\n        console.log("API Response [posts]:", postsData);`
);

fs.writeFileSync('index.html', index);
console.log('Fixed index.html posts log');
