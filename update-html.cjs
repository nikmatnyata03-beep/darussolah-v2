const fs = require('fs');

function update(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add skeleton classes to [data-name], [data-type], [data-about], [data-quote]
  // if they don't already have class attributes, we add them, or append if they do.
  
  content = content.replace(/<h1 data-name>Lembaga<\/h1>/, '<h1 data-name class="skeleton">Lembaga</h1>');
  content = content.replace(/<span data-name>Lembaga<small>/, '<span data-name class="skeleton">Lembaga<small>');
  content = content.replace(/<p class="lead" data-type>Pendidikan<\/p>/, '<p class="lead skeleton" data-type>Pendidikan</p>');
  content = content.replace(/<p class="lead" data-about>Deskripsi lembaga\.<\/p>/, '<p class="lead skeleton-block" style="height: 80px;" data-about>Deskripsi lembaga.</p>');
  content = content.replace(/<blockquote data-quote>Motto lembaga<\/blockquote>/, '<blockquote data-quote class="skeleton-block" style="height: 60px;">Motto lembaga</blockquote>');
  
  content = content.replace(/<div class="footer-name" data-name>Lembaga<\/div>/, '<div class="footer-name skeleton" data-name>Lembaga</div>');

  content = content.replace(/<p data-about>Detail lembaga\.<\/p>/, '<p data-about class="skeleton-block" style="height: 120px;">Detail lembaga.</p>');
  
  // images
  content = content.replace(/<img data-logo src="" alt="Logo">/g, '<img data-logo src="" alt="Logo" class="skeleton-img">');
  
  fs.writeFileSync(file, content);
}

update('tenant-landing.html');

let form = fs.readFileSync('tenant-pendaftaran.html', 'utf8');
form = form.replace(/<input type="text" id="program-pendidikan" name="institution_name" readonly value="Memuat...">/, '<input type="text" id="program-pendidikan" name="institution_name" readonly value="Memuat..." class="skeleton-block" style="height:40px; border:none; padding:10px 12px;">');
fs.writeFileSync('tenant-pendaftaran.html', form);

