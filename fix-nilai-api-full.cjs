const fs = require('fs');
let code = fs.readFileSync('nilai.html', 'utf8');

const newScript = `window.addEventListener('darussolah:ready', async () => {
         try {
            const res = await window.DarussolahPortal.fetchPrivate(null, 'students', window.DarussolahPortal.session);
            const progRes = await window.DarussolahPortal.fetchPrivate(null, 'admin/progress', window.DarussolahPortal.session);
            
            if (res && res.items && res.items.length) {
               studentsList = res.items;
               gradeRows.innerHTML = res.items.map(s => {
                  const initial = s.full_name.substring(0, 2).toUpperCase();
                  
                  // Find grades for this student
                  const pList = (progRes.items || []).filter(p => Number(p.student_id) === Number(s.id));
                  const getScore = (type) => {
                     const typed = pList.filter(p => p.current_value && p.target === 'Ujian Semester' && p.current_value.includes(type) || (p.type === type));
                     return typed.length ? typed[typed.length - 1].current_value : '0';
                  };
                  
                  const sTahsin = getScore('Tahsin');
                  const sTahfidz = getScore('Tahfidz');
                  const sAdab = getScore('Adab');
                  
                  const isLow = Number(sTahsin) < 75 || Number(sTahfidz) < 75 || Number(sAdab) < 75;
                  const pillStatus = isLow ? 'Perlu perhatian' : (sTahsin=='0' && sTahfidz=='0' && sAdab=='0') ? 'Belum diisi' : 'Tuntas';
                  const pillClass = isLow ? 'status-pill needs-review' : 'status-pill';
                  
                  return \\\`<tr data-name="\${s.full_name}" data-needs="\${isLow}">
                     <td><div class="student-cell"><span class="student-avatar">\${initial}</span><span class="student-detail">\${s.full_name}<small>ID: \${s.nis || '-'}</small></span></div></td>
                     <td><input class="score-input \${Number(sTahsin)<75?'low':''}" type="number" min="0" max="100" placeholder="0" value="\${sTahsin}" data-subject="Tahsin" data-student-id="\${s.id}" /></td>
                     <td><input class="score-input \${Number(sTahfidz)<75?'low':''}" type="number" min="0" max="100" placeholder="0" value="\${sTahfidz}" data-subject="Tahfidz" data-student-id="\${s.id}" /></td>
                     <td><input class="score-input \${Number(sAdab)<75?'low':''}" type="number" min="0" max="100" placeholder="0" value="\${sAdab}" data-subject="Adab" data-student-id="\${s.id}" /></td>
                     <td>-</td>
                     <td><span class="\${pillClass}">\${pillStatus}</span></td>
                     <td><button class="note-button" type="button" aria-label="Catatan \${s.full_name}">&hellip;</button></td>
                  </tr>\\\`;
               }).join('');
               
               document.querySelectorAll('.score-input').forEach((input) => input.addEventListener('change', () => updateRow(input, input.dataset.studentId)));
               document.querySelectorAll('.note-button').forEach((button) => button.addEventListener('click', () => showToast('Catatan santri.', 'Kolom catatan akhlak siap diisi pada detail rapor.')));
            } else {
               gradeRows.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:2rem;">Belum ada santri terdaftar</td></tr>';
            }
         } catch(e) {
            console.error('Error fetching students:', e);
         }
      });`;

const oldReady = /window\.addEventListener\('darussolah:ready', async \(\) => \{[\s\S]*?console\.error\('Error fetching students:', e\);\s*\}\s*\}\);/g;

code = code.replace(oldReady, newScript);
fs.writeFileSync('nilai.html', code);
console.log('Nilai fully fixed');
