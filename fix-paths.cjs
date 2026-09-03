const fs = require('fs');
let code = fs.readFileSync('darussolah-institution-site.js', 'utf8');

code = code.replace(/logo:'darussolah-assets\//g, "logo:'/darussolah-assets/");

fs.writeFileSync('darussolah-institution-site.js', code);
console.log('Fixed relative logo paths in JS');

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/src="darussolah-assets\//g, 'src="/darussolah-assets/');
fs.writeFileSync('index.html', index);
console.log('Fixed relative logo paths in HTML');
