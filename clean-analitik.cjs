const fs = require('fs');
let code = fs.readFileSync('analitik.html', 'utf8');

const regexScope = /const scopes=\{.*?\};/s;
code = code.replace(regexScope, '');

const regexChange = /document\.getElementById\('scopeSelect'\)\.addEventListener\('change',\s*\(event\)=>\{.*?\}\);/s;
code = code.replace(regexChange, '');

const regexInstName = /document\.querySelectorAll\('\.institution-copy strong'\)\.forEach\(.*?\);/s;
code = code.replace(regexInstName, '');

fs.writeFileSync('analitik.html', code);
