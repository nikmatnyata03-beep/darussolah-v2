const fs = require('fs');
let code = fs.readFileSync('tahfidz.html', 'utf8');

const targetScript = `window.addEventListener('darussolah:ready', async (event) => {
      // Load actual students
      try {
        const res = await window.DarussolahPortal.fetchPrivate(null, 'students', window.DarussolahPortal.session);
        const progRes = await window.DarussolahPortal.fetchPrivate(null, 'admin/progress', window.DarussolahPortal.session);
        
        if (res && res.items && res.items.length) {
          studentSelect.innerHTML = res.items.map(s => \\\`<option value="\${s.id}">\${s.full_name}</option>\\\`).join('');
          
          // Render cards
          const studentGrid = document.querySelector('.student-grid');
          if (studentGrid) {
            studentGrid.innerHTML = res.items.map(s => {
               // Find latest progress
               const pList = (progRes.items || []).filter(p => Number(p.student_id) === Number(s.id));
               const latest = pList.length ? pList[pList.length - 1] : null;
               
               let sub = 'Menunggu setoran';
               let stage = 'belum';
               let chip = 'Belum ada';
               let warn = false;
               
               if (latest) {
                 sub = latest.current_value;
                 stage = 'setoran';
                 chip = 'Tercatat';
                 if ((latest.notes || '').includes('Perlu bimbingan') || (latest.notes || '').includes('Ulangi')) {
                   warn = true;
                   stage = 'murojaah';
                   chip = 'Perlu murojaah';
                 }
               }
               
               return \\\`<article class="student-card" data-student="\${s.full_name}" data-stage="\${stage}"><div class="student-info"><strong>\${s.full_name}</strong><span class="student-sub">\${sub}</span></div><span class="stage-chip \${warn?'warn':''}">\${chip}</span></article>\\\`;
            }).join('');
            cards.length = 0;
            cards.push(...document.querySelectorAll('.student-card'));
          }
        }
      } catch (e) {
        console.error('Failed to load students for tahfidz:', e);
      }`;

// We will replace the previously patched darussolah:ready
const oldReady = /window\.addEventListener\('darussolah:ready', async \(event\) => \{[\s\S]*?console\.error\('Failed to load students for tahfidz:', e\);\s*\}/g;

code = code.replace(oldReady, targetScript);
fs.writeFileSync('tahfidz.html', code);
console.log('Tahfidz fully fixed');
