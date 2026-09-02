const fs = require('fs');
let html = fs.readFileSync('kepegawaian.html', 'utf8');

const submitScript = `
    document.getElementById('staffForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const name = document.getElementById('staffName').value.trim() || 'Guru baru';
      const qualification = document.getElementById('staffQualification').value.trim();
      const status = document.getElementById('staffStatus').value;
      const jtm = parseInt(document.getElementById('staffJtm').value) || 0;
      
      const payload = {
        full_name: name,
        role: 'guru',
        status: status
      };

      try {
        const res = await window.DarussolahPortal.requestPrivate(null, 'admin/staff', window.DarussolahPortal.session, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const safe = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
        const initials = name.split(/\s+/).map(part => part[0]).join('').slice(0,2).toUpperCase();
        const row = document.createElement('tr');
        row.dataset.staff = status === 'fixed' ? 'active' : 'inactive';
        row.innerHTML = \`<td><div class="student-cell"><span class="payer-avatar">\${safe(initials||'GR')}</span><span class="student-detail">\${safe(name)}<small>Guru · \${safe(qualification)}</small></span></div></td><td><span class="status-pill \${status==='fixed'?'':'pending'}">\${status==='fixed'?'Tetap':'Honorer'}</span></td><td>TPQ Darul Jinan</td><td><span class="status-pill">\${jtm} JTM</span></td><td><button class="row-action" type="button" data-staff-action="\${safe(name)}">Detail</button></td>\`;
        
        document.querySelector('#staffRows').prepend(row);
        setModal('staffModal', false);
        event.target.reset();
        refreshStaff();
        showToast('Data guru tersimpan', \`\${name} berhasil disimpan di database.\`);
      } catch (err) {
        showToast('Gagal', 'Terjadi kesalahan saat menyimpan guru.');
      }
    });
`;

if (!html.includes('staffForm\').addEventListener(\'submit\'')) {
  html = html.replace('  </script>', submitScript + '\n  </script>');
  fs.writeFileSync('kepegawaian.html', html);
  console.log('kepegawaian.html fixed');
}
