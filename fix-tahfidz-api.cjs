const fs = require('fs');
let code = fs.readFileSync('tahfidz.html', 'utf8');

const regex = /recordForm\.addEventListener\('submit', \(event\) => \{[\s\S]*?showToast\('Capaian dicatat\.', `\$\{student\} - \$\{kind\} - \$\{score\}\. Kartu progres diperbarui di sesi ini\.'\);\s*\}\);/g;

const newListener = `recordForm.addEventListener('submit', async (event) => {
         event.preventDefault();
         const studentId = studentSelect.value;
         const studentName = studentSelect.options[studentSelect.selectedIndex].text;
         const target = document.querySelector('#record-target').value.trim() || 'Capaian baru';
         const kind = document.querySelector('[data-kind].active')?.dataset.kind === 'tahsin' ? 'Tahsin' : 'Tahfidz';
         const scoreButton = document.querySelector('[data-score].active');
         const score = scoreButton?.textContent.trim() || 'Lancar';
         const needsReview = ['Perlu bimbingan', 'Ulangi besok'].includes(score);
         const note = document.querySelector('#record-note').value.trim();

         // Update local UI immediately for optimistic feedback
         const card = cards.find(item => item.dataset.student === studentName);
         if (card) {
           card.querySelector('.student-sub').textContent = \`\${kind} - \${target}\`;
           const chip = card.querySelector('.stage-chip');
           chip.textContent = needsReview ? 'Perlu murojaah' : 'Tercatat hari ini';
           chip.classList.toggle('warn', needsReview);
           chip.classList.remove('blue');
           card.dataset.stage = needsReview ? 'murojaah' : 'setoran';
         }

         try {
           await window.DarussolahPortal.requestPrivate(null, 'admin/progress', window.DarussolahPortal.session, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               student_id: studentId,
               type: kind,
               current_value: kind + ' - ' + score,
               target: target,
               notes: note
             })
           });
           showToast('Capaian dicatat.', \`\${studentName} - \${kind} - \${score} telah disimpan ke database.\`);
           recordForm.reset();
         } catch (error) {
           console.error('Failed to save progress:', error);
           showToast('Gagal.', 'Gagal mencatat capaian. Silakan periksa koneksi atau sesi.');
         }
       });`;

code = code.replace(regex, newListener);

// Also we need to populate the select options
const scriptReadyRegex = /window\.addEventListener\('darussolah:ready', \(event\) => \{/g;
const newScriptReady = `window.addEventListener('darussolah:ready', async (event) => {
      // Load actual students
      try {
        const res = await window.DarussolahPortal.fetchPrivate(null, 'students', window.DarussolahPortal.session);
        if (res && res.items && res.items.length) {
          studentSelect.innerHTML = res.items.map(s => \`<option value="\${s.id}">\${s.full_name}</option>\`).join('');
          
          // Render cards
          const studentGrid = document.querySelector('.student-grid');
          if (studentGrid) {
            studentGrid.innerHTML = res.items.map(s => \`<article class="student-card" data-student="\${s.full_name}" data-stage="belum"><div class="student-info"><strong>\${s.full_name}</strong><span class="student-sub">Menunggu setoran</span></div><span class="stage-chip">Belum ada</span></article>\`).join('');
            cards.length = 0;
            cards.push(...document.querySelectorAll('.student-card'));
          }
        }
      } catch (e) {
        console.error('Failed to load students for tahfidz:', e);
      }`;

code = code.replace(scriptReadyRegex, newScriptReady);

fs.writeFileSync('tahfidz.html', code);
console.log('Fixed tahfidz.html');
