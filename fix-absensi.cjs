const fs = require('fs');
let html = fs.readFileSync('absensi.html', 'utf8');

// Replace Supabase client with our standard requestPrivate
const supabaseBlock = `
         try {
           const {data: sessionData} = await portal.client.auth.getSession();
           const token = sessionData.session?.access_token;
           if (!token) throw new Error('Unauthenticated');
           
           await fetch(\`\${portal.config.apiBase}/v1/private/\${encodeURIComponent(portal.config.tenantSlug)}/attendance\`, {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
               'Authorization': \`Bearer \${token}\`
             },
             body: JSON.stringify({
               class_id: portal.primaryClass.id,
               attendance_date: new Date().toISOString().slice(0, 10),
               records
             })
           });

           showToast('Absensi tersimpan.', \`\${total} perubahan telah disinkronkan ke server.\`);
           document.querySelector('#sync-title').textContent = 'Sinkronisasi berhasil';
           document.querySelector('#sync-detail').textContent = 'Semua perubahan telah tersimpan aman.';
         } catch (error) {
           console.error('Save failed:', error);
           showToast('Koneksi belum tersedia.', 'Perubahan tetap ada di layar dan dapat dicoba lagi.');
         }
`;

const newBlock = `
         try {
           await window.DarussolahPortal.requestPrivate(null, 'attendance', window.DarussolahPortal.session, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               class_id: portal.primaryClass?.id,
               attendance_date: new Date().toISOString().slice(0, 10),
               records
             })
           });

           showToast('Absensi tersimpan.', \`\${total} perubahan telah disinkronkan ke server.\`);
           document.querySelector('#sync-title').textContent = 'Sinkronisasi berhasil';
           document.querySelector('#sync-detail').textContent = 'Semua perubahan telah tersimpan aman.';
         } catch (error) {
           console.error('Save failed:', error);
           showToast('Gagal.', 'Perubahan gagal disimpan. Silakan coba lagi.');
         }
`;

if (html.includes('portal.client.auth.getSession()')) {
  // Use a softer replace since exact match might have different spacing
  html = html.replace(/try\s*\{\s*const\s*\{\s*data\s*:\s*sessionData[^]*?\}\s*catch\s*\(error\)\s*\{[^]*?showToast\('Koneksi belum tersedia[^]*?\}/m, newBlock);
  fs.writeFileSync('absensi.html', html);
  console.log("absensi.html fixed");
}
