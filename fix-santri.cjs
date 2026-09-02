const fs = require('fs');
let html = fs.readFileSync('santri.html', 'utf8');

const replacementScript = `
    document.querySelector('#studentForm').addEventListener('submit', async event => {
      event.preventDefault();
      const name = document.querySelector('#studentName').value.trim() || 'Santri baru';
      const nis = document.querySelector('#studentNis').value.trim() || \`DJ-TPQ-\${String(6+added).padStart(3,'0')}\`;
      const age = document.querySelector('#studentAge').value || '—';
      const unit = document.querySelector('#studentClass').value;
      const guardian = document.querySelector('#studentGuardian').value.trim() || 'Belum dihubungkan';
      
      const payload = {
        full_name: name,
        nis: nis,
        class_id: unit,
        guardian_name: guardian,
        status: 'pending'
      };

      try {
        const res = await window.DarussolahPortal.requestPrivate(null, 'admin/students', window.DarussolahPortal.session, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const safe = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
        const initials = name.split(/\s+/).map(part => part[0]).join('').slice(0,2).toUpperCase();
        const row = document.createElement('tr');
        row.dataset.status = 'pending';
        row.innerHTML = \`<td><div class="student-cell"><span class="payer-avatar">\${safe(initials||'SN')}</span><span class="student-detail">\${safe(name)}<small>\${safe(nis)} · \${safe(age)} tahun</small></span></div></td><td>\${safe(unit)}</td><td>\${safe(guardian)}</td><td><span class="status-pill pending">Perlu dilengkapi</span></td><td><span class="status-pill pending">Kurang 1</span></td><td><button class="row-action" type="button" data-detail="\${safe(name)}">Detail</button></td>\`;
        
        document.querySelector('#studentRows').prepend(row);
        row.querySelector('[data-detail]').addEventListener('click', () => showToast(\`Detail \${name}\`, 'Profil, wali, kelas, dan dokumen siap ditinjau.'));
        
        added += 1;
        const total = 32 + added;
        const guardians = 28 + added;
        document.querySelector('#studentTotal').textContent = total;
        document.querySelector('#activeTotal').textContent = '29';
        document.querySelector('#guardianTotal').textContent = guardians;
        document.querySelector('#documentTotal').textContent = String(3+added).padStart(2,'0');
        
        closeModal();
        event.target.reset();
        refresh();
        showToast('Data santri tersimpan', \`\${name} berhasil disimpan di database.\`);
      } catch (err) {
        showToast('Gagal', 'Terjadi kesalahan saat menyimpan santri.');
      }
    });
`;

html = html.replace(/document\.querySelector\('#studentForm'\)\.addEventListener\('submit',event=>\{event\.preventDefault\(\);const name=[^]*?masuk sebagai data yang perlu dilengkapi\.'\)\}\);/, replacementScript);

fs.writeFileSync('santri.html', html);
console.log('santri.html fixed');
