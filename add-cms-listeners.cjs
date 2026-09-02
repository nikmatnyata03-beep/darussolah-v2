const fs = require('fs');
let html = fs.readFileSync('cms.html', 'utf8');

const listeners = `
    document.getElementById('testiForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      setModal('testiModal', false);
      showToast('Testimoni disimpan', 'Testimoni baru akan segera tampil di halaman beranda.');
      e.target.reset();
    });

    document.getElementById('guruForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      setModal('guruModal', false);
      showToast('Profil guru disimpan', 'Ringkasan biografi guru telah diperbarui di beranda.');
      e.target.reset();
    });
`;

if (!html.includes('testiForm\')?.addEventListener')) {
  html = html.replace('</script></body>', listeners + '\n</script></body>');
  fs.writeFileSync('cms.html', html);
}
