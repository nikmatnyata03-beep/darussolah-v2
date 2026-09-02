const fs = require('fs');
let code = fs.readFileSync('nilai.html', 'utf8');

const targetRegex = /const rows = \[\.\.\.document\.querySelectorAll\('#grade-rows tr'\)\];[\s\S]*?modal\.hidden = true; \}\);/g;

const newScript = `const gradeRows = document.querySelector('#grade-rows');
      let studentsList = [];
      const modal = document.querySelector('#report-modal');
      const toast = document.querySelector('#toast');
      document.querySelector('.approval-panel')?.setAttribute('id', 'approval');

      const updateRow = async (input, studentId) => {
        let score = Number(input.value);
        if (score > 100) score = 100;
        if (score < 0) score = 0;
        input.value = score;
        input.classList.toggle('low', score < 75);
        const row = input.closest('tr');
        const needsReview = [...row.querySelectorAll('.score-input')].some((item) => Number(item.value) < 75);
        row.dataset.needs = String(needsReview);
        const status = row.querySelector('.status-pill');
        status.textContent = needsReview ? 'Perlu perhatian' : 'Tuntas';
        status.classList.toggle('needs-review', needsReview);
        
        // Find subject type from the table header index or data attribute
        const subject = input.dataset.subject || 'Nilai';

        try {
           await window.DarussolahPortal.requestPrivate(null, 'admin/progress', window.DarussolahPortal.session, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               student_id: studentId,
               type: subject,
               current_value: score.toString(),
               target: 'Ujian Semester'
             })
           });
           showToast('Nilai tersimpan.', 'Data rapor berhasil disinkronkan ke server.');
        } catch(e) {
           console.error(e);
           showToast('Gagal menyimpan', 'Periksa koneksi Anda.');
        }
      };

      window.addEventListener('darussolah:ready', async () => {
         try {
            const res = await window.DarussolahPortal.fetchPrivate(null, 'students', window.DarussolahPortal.session);
            if (res && res.items && res.items.length) {
               studentsList = res.items;
               gradeRows.innerHTML = res.items.map(s => {
                  const initial = s.full_name.substring(0, 2).toUpperCase();
                  return \`<tr data-name="\${s.full_name}" data-needs="false">
                     <td><div class="student-cell"><span class="student-avatar">\${initial}</span><span class="student-detail">\${s.full_name}<small>ID: \${s.nis || '-'}</small></span></div></td>
                     <td><input class="score-input" type="number" min="0" max="100" placeholder="0" data-subject="Tahsin" data-student-id="\${s.id}" /></td>
                     <td><input class="score-input" type="number" min="0" max="100" placeholder="0" data-subject="Tahfidz" data-student-id="\${s.id}" /></td>
                     <td><input class="score-input" type="number" min="0" max="100" placeholder="0" data-subject="Adab" data-student-id="\${s.id}" /></td>
                     <td>-</td>
                     <td><span class="status-pill">Belum diisi</span></td>
                     <td><button class="note-button" type="button" aria-label="Catatan \${s.full_name}">&hellip;</button></td>
                  </tr>\`;
               }).join('');
               
               document.querySelectorAll('.score-input').forEach((input) => input.addEventListener('change', () => updateRow(input, input.dataset.studentId)));
               document.querySelectorAll('.note-button').forEach((button) => button.addEventListener('click', () => showToast('Catatan santri.', 'Kolom catatan akhlak siap diisi pada detail rapor.')));
            } else {
               gradeRows.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem;">Belum ada santri terdaftar</td></tr>';
            }
         } catch(e) {
            console.error('Error fetching students:', e);
         }
      });
      
      document.querySelectorAll('select').forEach((select) => select.addEventListener('change', () => showToast('Tampilan diperbarui.', \`\${select.value} sedang ditampilkan.\`)));
      document.querySelector('#journal-button').addEventListener('click', () => showToast('Jurnal guru siap.', 'Tambahkan ringkasan materi dan catatan pertemuan hari ini.'));
      document.querySelector('#akhlak-button').addEventListener('click', () => showToast('Catatan akhlak siap.', 'Kolom penilaian non-akademik akan terbuka di detail rapor.'));
      document.querySelectorAll('[data-open-report]').forEach((button) => button.addEventListener('click', () => { modal.hidden = false; }));
      document.querySelectorAll('[data-close-report]').forEach((button) => button.addEventListener('click', () => { modal.hidden = true; }));
      document.addEventListener('keydown', (event) => { if (event.key === 'Escape') modal.hidden = true; });`;

code = code.replace(targetRegex, newScript);
fs.writeFileSync('nilai.html', code);
console.log('Fixed nilai.html');
