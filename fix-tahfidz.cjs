const fs = require('fs');

// Add endpoint to server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
const progressEndpoint = `
app.post('/v1/private/:tenant_slug/admin/progress', requireAuth, async (req, res) => {
  try {
    const { student_id, type, current_value, target, notes, status } = req.body;
    
    // Convert to schema
    const val = {
      studentId: parseInt(student_id),
      type: type || 'tahfidz',
      currentValue: current_value,
      target: target,
      notes: notes,
      status: status || 'active',
      recordedAt: new Date()
    };

    const { studentProgress } = require('./src/db/schema.ts');
    await db.insert(studentProgress).values(val);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
`;

if (!serverCode.includes('/admin/progress')) {
  serverCode = serverCode.replace('// --- Admin Endpoints ---', progressEndpoint + '\n// --- Admin Endpoints ---');
  fs.writeFileSync('server.ts', serverCode);
  console.log("progress endpoint added");
}

// Fix tahfidz.html
let tahfidzHtml = fs.readFileSync('tahfidz.html', 'utf8');

const tahfidzReplace = `
       recordForm.addEventListener('submit', async (event) => {
         event.preventDefault();
         const student = studentSelect.value;
         const target = document.querySelector('#record-target').value.trim() || 'Capaian baru';
         const kind = document.querySelector('[data-kind].active')?.dataset.kind === 'tahsin' ? 'Tahsin' : 'Tahfidz';
         const scoreButton = document.querySelector('[data-score].active');
         const score = scoreButton?.textContent.trim() || 'Lancar';
         const needsReview = ['Perlu bimbingan', 'Ulangi besok'].includes(score);

         try {
           const stdNode = document.querySelector(\`#record-student option[value="\${student}"]\`);
           const studentId = stdNode?.dataset?.id || 1;

           await window.DarussolahPortal.requestPrivate(null, 'admin/progress', window.DarussolahPortal.session, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               student_id: studentId,
               type: kind,
               current_value: target,
               notes: score,
               status: needsReview ? 'murojaah' : 'setoran'
             })
           });

           const card = cards.find(item => item.dataset.student === student);
           if (card) {
             card.querySelector('.student-sub').textContent = \`\${kind} - \${target}\`;
             const chip = card.querySelector('.stage-chip');
             chip.textContent = needsReview ? 'Perlu murojaah' : 'Tercatat hari ini';
             chip.classList.toggle('warn', needsReview);
             chip.classList.remove('blue');
             card.dataset.stage = needsReview ? 'murojaah' : 'setoran';
           }
           showToast('Capaian dicatat.', \`\${student} - \${kind} - \${score}. Tersimpan di database.\`);
         } catch(e) {
           showToast('Gagal', 'Terjadi kesalahan jaringan.');
         }
       });
`;

tahfidzHtml = tahfidzHtml.replace(/recordForm\.addEventListener\('submit', \(event\) => \{[\s\S]*?showToast\('Capaian dicatat\.', `\$\{student\} - \$\{kind\} - \$\{score\}\. Kartu progres diperbarui di sesi ini\.'\);\s*\}\);/m, tahfidzReplace);

fs.writeFileSync('tahfidz.html', tahfidzHtml);
console.log('tahfidz.html fixed');

