const fs = require('fs');
let html = fs.readFileSync('kepegawaian.html', 'utf8');

const targetForm = `<div class="form-field"><label for="staffJtm">JTM per minggu</label><input id="staffJtm" required type="number" min="0" placeholder="18" /></div></div><button class="btn btn-primary" style="width:100%;margin-top:18px" type="submit">Simpan data guru</button></form>`;
const replacementForm = `<div class="form-field"><label for="staffJtm">JTM per minggu</label><input id="staffJtm" required type="number" min="0" placeholder="18" /></div><div class="form-field full" style="grid-column: 1 / -1;"><label for="staffBio">Biodata / Deskripsi singkat</label><textarea id="staffBio" rows="3" placeholder="Contoh: Mengajar mapel Aqidah sejak 2020..." style="width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: 6px; font-family: inherit; resize: vertical;"></textarea></div></div><button class="btn btn-primary" style="width:100%;margin-top:18px" type="submit">Simpan data guru</button></form>`;

html = html.replace(targetForm, replacementForm);

const targetModal = `<p id="detailCopy">Riwayat mengajar, jadwal, dan rekap kehadiran tersimpan di sini.</p><div class="dialog-actions">`;
const replacementModal = `<p id="detailCopy">Riwayat mengajar, jadwal, dan rekap kehadiran tersimpan di sini.</p><div id="bioContainer" style="margin-top: 16px; padding: 12px; background: var(--sand); border-radius: 8px; display: none;"><strong style="display: block; margin-bottom: 4px; font-size: 0.85rem; color: var(--pine-light);">BIODATA SINGKAT</strong><p id="detailBio" style="font-size: 0.95rem; margin: 0; color: var(--ink); line-height: 1.5;"></p></div><div class="dialog-actions">`;

html = html.replace(targetModal, replacementModal);

// Now update the script to handle the biodata
const targetScript = `document.querySelectorAll('[data-staff-action]').forEach((button)=>button.addEventListener('click',()=>{document.getElementById('detailTitle').textContent=button.dataset.staffAction;document.getElementById('detailCopy').textContent=\`\${button.dataset.staffAction} memiliki jadwal aktif dan rekap kehadiran yang siap ditinjau.\`;setModal('detailModal',true);}));`;

const replacementScript = `document.querySelectorAll('[data-staff-action]').forEach((button)=>button.addEventListener('click',()=>{
  document.getElementById('detailTitle').textContent=button.dataset.staffAction;
  document.getElementById('detailCopy').textContent=\`\${button.dataset.staffAction} memiliki jadwal aktif dan rekap kehadiran yang siap ditinjau.\`;
  
  const bio = button.dataset.staffBio;
  const bioContainer = document.getElementById('bioContainer');
  const bioText = document.getElementById('detailBio');
  if (bio) {
    bioText.textContent = bio;
    bioContainer.style.display = 'block';
  } else {
    bioContainer.style.display = 'none';
  }
  
  setModal('detailModal',true);
}));`;

html = html.replace(targetScript, replacementScript);

// Add sample biodata to the buttons
html = html.replace(`data-staff-action="Ustadzah Nisa"`, `data-staff-action="Ustadzah Nisa" data-staff-bio="Lulusan S1 Pendidikan Agama Islam UIN Sunan Kalijaga. Mengajar mapel Fiqih dan Al-Qur'an Hadits sejak 2018."`);
html = html.replace(`data-staff-action="Ustadz Ahmad Rasyid"`, `data-staff-action="Ustadz Ahmad Rasyid" data-staff-bio="Berpengalaman lebih dari 6 tahun mengajar di MDT. Aktif dalam penyusunan kurikulum diniyah."`);
html = html.replace(`data-staff-action="Ustadzah Laila Fitria"`, `data-staff-action="Ustadzah Laila Fitria" data-staff-bio="Fokus pada pendidikan usia dini (RA). Memiliki sertifikasi khusus pengajaran metode tilawati."`);
html = html.replace(`data-staff-action="Ustadz Fikri Hidayat"`, `data-staff-action="Ustadz Fikri Hidayat" data-staff-bio="Pembina kegiatan ekstrakurikuler tahfidz. Alumni Pondok Pesantren Lirboyo."`);
html = html.replace(`data-staff-action="Ustadzah Salma Aini"`, `data-staff-action="Ustadzah Salma Aini" data-staff-bio="Pengajar baru yang berdedikasi tinggi. Sedang menyelesaikan studi S2 Pendidikan Islam."`);

// Handle form submission to show a toast mentioning biodata saved
const formListener = `document.getElementById('staffForm').addEventListener('submit', (e) => {
  e.preventDefault();
  setModal('staffModal', false);
  showToast('Data guru disimpan', 'Identitas dan biodata singkat telah diperbarui.');
  e.target.reset();
});`;

if (!html.includes('staffForm\').addEventListener')) {
  html = html.replace(`</script></body>`, `\n${formListener}\n</script></body>`);
}

fs.writeFileSync('kepegawaian.html', html);
