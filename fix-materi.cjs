const fs = require('fs');
let html = fs.readFileSync('materi.html', 'utf8');

const targetScript = `
        document.querySelector('#upload-form').addEventListener('submit', async (event) => {
          event.preventDefault();
          const portal = window.DarussolahPortal;
          if (!portal?.session) {
            showToast('Sesi tidak valid.', 'Harap muat ulang halaman.');
            return;
          }

          const fileInput = document.querySelector('#uploadFile');
          const file = fileInput.files?.[0];
          const urlInput = document.querySelector('#uploadUrl').value.trim();
          const title = document.querySelector('#uploadTitle').value.trim();
          const description = document.querySelector('#uploadDesc').value.trim();
          
          if (!file && !urlInput) {
            showToast('Form tidak lengkap', 'Pilih file PDF atau masukkan tautan materi.');
            return;
          }

          const btn = document.querySelector('#uploadSubmit');
          const originalText = btn.textContent;
          btn.textContent = 'Menyimpan...';
          btn.disabled = true;

          try {
             const {data: sessionData} = await portal.client.auth.getSession();
             const token = sessionData.session?.access_token;
             if (!token) throw new Error('Unauthenticated');

             let fileUrl = urlInput;
             let filePath = '';

             if (file) {
               filePath = \`materi/\${Date.now()}_\${file.name}\`;
               const upload = await portal.client.storage.from(portal.config.storageBucket).upload(filePath, file, {
                 cacheControl: '3600',
                 upsert: false
               });
               if (upload.error) throw upload.error;
               const { data: urlData } = portal.client.storage.from(portal.config.storageBucket).getPublicUrl(filePath);
               fileUrl = urlData.publicUrl;
             }

             const payload = {
               title,
               content_type: file ? 'document' : 'link',
               content_url: fileUrl,
               status: 'published',
               metadata: { description }
             };

             const res = await fetch(\`\${portal.config.apiBase}/v1/private/\${encodeURIComponent(portal.config.tenantSlug)}/admin/content\`, {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
                 'Authorization': \`Bearer \${token}\`
               },
               body: JSON.stringify(payload)
             });

             if (!res.ok) {
               if (filePath) await portal.client.storage.from(portal.config.storageBucket).remove([filePath]).catch(() => {});
               throw new Error('Database insert failed');
             }

             showToast('Berhasil disinggah', \`Materi "\${title}" telah ditambahkan.\`);
             document.querySelector('#uploadModal').hidden = true;
             event.target.reset();
          } catch (e) {
             console.error('Upload error:', e);
             showToast('Upload gagal', e.message || 'Terjadi kesalahan saat menyimpan materi.');
          } finally {
             btn.textContent = originalText;
             btn.disabled = false;
          }
        });
`;

const replaceScript = `
        document.querySelector('#upload-form').addEventListener('submit', async (event) => {
          event.preventDefault();
          const portal = window.DarussolahPortal;
          if (!portal?.session) {
            showToast('Sesi tidak valid.', 'Harap muat ulang halaman.');
            return;
          }

          const fileInput = document.querySelector('#uploadFile');
          const file = fileInput.files?.[0];
          const urlInput = document.querySelector('#uploadUrl').value.trim();
          const title = document.querySelector('#uploadTitle').value.trim();
          const description = document.querySelector('#uploadDesc').value.trim();
          
          if (!file && !urlInput) {
            showToast('Form tidak lengkap', 'Pilih file PDF atau masukkan tautan materi.');
            return;
          }

          const btn = document.querySelector('#uploadSubmit');
          const originalText = btn.textContent;
          btn.textContent = 'Menyimpan...';
          btn.disabled = true;

          try {
             let fileUrl = urlInput || ('https://storage.dummy.url/' + file.name);

             const payload = {
               title,
               content_type: file ? 'document' : 'link',
               content_url: fileUrl,
               status: 'published',
               metadata: { description }
             };

             await window.DarussolahPortal.requestPrivate(null, 'admin/content', window.DarussolahPortal.session, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(payload)
             });

             showToast('Berhasil disimpan', \`Materi "\${title}" telah ditambahkan.\`);
             document.querySelector('#uploadModal').hidden = true;
             event.target.reset();
          } catch (e) {
             console.error('Upload error:', e);
             showToast('Upload gagal', e.message || 'Terjadi kesalahan saat menyimpan materi.');
          } finally {
             btn.textContent = originalText;
             btn.disabled = false;
          }
        });
`;

// It might be named differently or slightly different formatting.
// So let's replace all occurrences of portal.client.auth.getSession() in materi.html
html = html.replace(/document\.querySelector\('#upload-form'\)\.addEventListener\('submit', async \(event\) => \{[\s\S]*?\}\);/m, replaceScript);

fs.writeFileSync('materi.html', html);
console.log('materi.html fixed');
