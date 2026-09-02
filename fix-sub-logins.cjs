const fs = require('fs');

const files = [
  'tpq-darul-jinan.html',
  'mdt-darussolah.html',
  'ra-darussolah.html',
  'rtq-darussolah.html'
];

const loginFormRegex = /<form class="form" id="login">[\s\S]*?<\/form>/;
const replacement = `
<div class="form" id="login" style="text-align: center; padding: 20px 0;">
  <a href="login.html" class="primary" style="display: inline-block; padding: 12px 24px; text-decoration: none;">Masuk dengan Google &rarr;</a>
</div>
`;

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(loginFormRegex, replacement);
  fs.writeFileSync(file, html);
  console.log('Updated ' + file);
}
