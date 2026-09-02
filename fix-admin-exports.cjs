const fs = require('fs');
let code = fs.readFileSync('darussolah-admin.js', 'utf8');

// Add export functionality for all modules
const target = `    if (target.id === 'backupButton' || target.id === 'backupTop') { event.preventDefault(); event.stopImmediatePropagation(); try { const result = await api('admin/export'); download(\`backup-darussolah-\${new Date().toISOString().slice(0, 10)}.json\`, JSON.stringify(result, null, 2), 'application/json'); const time = document.getElementById('backupTime'); if (time) time.textContent = 'Baru saja'; toast('Backup selesai', 'Salinan data berhasil diunduh.'); } catch (error) { toast('Backup gagal', error.message); } return; }`;

const insertion = `
    if (target.id === 'exportStaff') { event.preventDefault(); event.stopImmediatePropagation(); exportModule('staff', 'kepegawaian-darussolah.csv', state.staff); return; }
    if (target.id === 'exportButton' && page === 'notifikasi.html') { event.preventDefault(); event.stopImmediatePropagation(); exportModule('notifications', 'notifikasi-darussolah.csv'); return; }
    if (target.dataset.action === 'export' && page === 'keuangan.html') { event.preventDefault(); event.stopImmediatePropagation(); exportModule('finance', 'keuangan-darussolah.csv'); return; }
`;

code = code.replace(target, insertion + '\\n' + target);

fs.writeFileSync('darussolah-admin.js', code);
