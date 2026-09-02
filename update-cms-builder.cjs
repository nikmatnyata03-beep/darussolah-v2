const fs = require('fs');
let html = fs.readFileSync('cms.html', 'utf8');

// 1. Add "Editor Beranda" to the Sidebar Navigation
const navTarget = `<a href="#testimoni" class="nav-link"><span>Testimoni</span></a>`;
const navReplacement = `<a href="#testimoni" class="nav-link"><span>Testimoni</span></a>
        <a href="#builder" class="nav-link"><span>Editor Beranda</span></a>
        <a href="#backups" class="nav-link"><span>Backup & Restore</span></a>`;
if (!html.includes('href="#builder"')) {
  html = html.replace(navTarget, navReplacement);
}

// 2. Add the Panels to the Main Content area
const panelTarget = `</main>`;
const panelReplacement = `
        <section class="panel" id="builder" aria-labelledby="builderHeading">
          <div class="panel-header">
            <div class="panel-heading">
              <h2 id="builderHeading">Editor Tata Letak & Konten (Beranda)</h2>
              <p>Mode visual untuk mengubah teks, menggeser tata letak, dan menghapus blok konten.</p>
            </div>
            <a href="/?edit=true" target="_blank" class="btn btn-primary">Buka Live Editor ↗</a>
          </div>
          <div style="background: var(--sand); border: 1px solid var(--line); border-radius: 12px; padding: 24px; text-align: center; margin-top: 24px;">
            <p style="margin-bottom: 16px; color: var(--ink);"><strong>Bagaimana cara kerjanya?</strong></p>
            <p style="color: var(--muted); font-size: 0.95rem; margin-bottom: 24px;">Klik tombol di atas untuk membuka halaman beranda dalam <strong>Mode Edit Visual</strong>. Anda dapat langsung mengklik teks untuk mengubahnya, menggeser urutan bagian, dan menambah blok baru. Setiap perubahan akan di-backup otomatis.</p>
            <a href="/?edit=true" target="_blank" class="btn btn-primary">Buka Live Editor ↗</a>
          </div>
        </section>

        <section class="panel" id="backups" aria-labelledby="backupsHeading">
          <div class="panel-header">
            <div class="panel-heading">
              <h2 id="backupsHeading">Backup & Restore</h2>
              <p>Setiap kali Anda menyimpan perubahan di Live Editor, sistem akan membuat backup otomatis. Anda dapat memulihkan (restore) versi sebelumnya di sini.</p>
            </div>
            <button class="btn btn-ghost" type="button" onclick="loadBackups()">↻ Muat Ulang Daftar Backup</button>
          </div>
          <div class="table-wrap" style="margin-top: 24px;">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 60%">Nama File Backup (Timestamp)</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="backupList">
                <tr><td colspan="2" style="text-align:center;color:var(--muted)">Memuat daftar backup...</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
`;
if (!html.includes('id="builder"')) {
  html = html.replace(panelTarget, panelReplacement);
}

// 3. Add JS for fetching and restoring backups
const scriptTarget = `</script></body>`;
const scriptReplacement = `
  async function loadBackups() {
    const list = document.getElementById('backupList');
    list.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--muted)">Memuat daftar backup...</td></tr>';
    try {
      const res = await fetch('/api/page/backups');
      const data = await res.json();
      if (!data.backups || data.backups.length === 0) {
        list.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--muted)">Belum ada file backup.</td></tr>';
        return;
      }
      list.innerHTML = data.backups.map(file => {
        // file format: index-2026-09-02T01-44-30-000Z.html
        const rawDate = file.replace('index-', '').replace('.html', '').replace(/-/g, ':').replace('T', ' ');
        return \`<tr>
          <td><strong>\${file}</strong></td>
          <td>
            <button class="row-action" type="button" onclick="restoreBackup('\${file}')">Pulihkan (Restore)</button>
          </td>
        </tr>\`;
      }).join('');
    } catch (err) {
      console.error(err);
      list.innerHTML = '<tr><td colspan="2" style="text-align:center;color:red">Gagal memuat daftar backup.</td></tr>';
    }
  }

  async function restoreBackup(filename) {
    if (!confirm('Peringatan: Mengembalikan backup ini akan menimpa halaman beranda saat ini. Yakin ingin melanjutkan?')) return;
    
    try {
      const res = await fetch('/api/page/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      
      if (res.ok) {
        showToast('Berhasil Dipulihkan', 'Halaman beranda telah dikembalikan ke versi backup.');
        loadBackups(); // reload list just in case a new pre-restore backup was generated
      } else {
        showToast('Gagal', 'Terjadi kesalahan saat pemulihan.');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal', 'Terjadi kesalahan jaringan.');
    }
  }

  // Load backups when nav is clicked or initially
  document.addEventListener('DOMContentLoaded', () => {
    loadBackups();
  });
</script></body>
`;
if (!html.includes('loadBackups()')) {
  html = html.replace(scriptTarget, scriptReplacement);
}

fs.writeFileSync('cms.html', html);
