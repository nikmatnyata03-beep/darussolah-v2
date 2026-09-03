const fs = require('fs');
let code = fs.readFileSync('tenant-landing.html', 'utf8');

const regex = /<section class="wrap section" id="register">[\s\S]*?<\/section>/s;
const replacement = `<section class="wrap section" id="register">
  <div class="panel" style="text-align: center; padding: 60px 20px;">
    <span class="eyebrow">Penerimaan santri</span>
    <h2 style="margin-bottom: 15px;">Mulai pendaftaran sekarang.</h2>
    <p style="margin-bottom: 30px; max-width: 500px; margin-left: auto; margin-right: auto;">Isi formulir pendaftaran secara lengkap, atau lakukan daftar ulang untuk santri lama.</p>
    <a href="pendaftaran.html" class="primary button" style="display: inline-block; padding: 14px 28px; text-decoration: none; border-radius: 6px; background: #1b4332; color: white; font-weight: 600;">Buka Formulir Pendaftaran &rarr;</a>
  </div>
</section>`;

if(code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('tenant-landing.html', code);
  console.log('Cleaned landing page form');
}
