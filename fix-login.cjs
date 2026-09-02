const fs = require('fs');
let html = fs.readFileSync('login.html', 'utf8');
html = html.replace('const accessToken = credential?.accessToken || (await result.user.getIdToken());', 'const accessToken = await result.user.getIdToken();');
fs.writeFileSync('login.html', html);
